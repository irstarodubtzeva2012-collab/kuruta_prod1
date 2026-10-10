import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Prisma, TaskStatus } from '@prisma/client';
import { prisma } from '@kuruta/database';
import { FinanceService } from '../finance/finance.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private readonly financeService: FinanceService,
    @InjectQueue('task-queue') private readonly taskQueue: Queue,
  ) {}

  /**
   * Получение задачи
   */
  async getTask(taskId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        campaign: {
          include: {
            creator: {
              select: {
                id: true,
                displayName: true,
              },
            },
          },
        },
        ambassador: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  /**
   * Получение списка доступных задач для амбассадора
   */
  async getAvailableTasks(ambassadorId: string, campaignId?: string) {
    const where: Prisma.TaskWhereInput = {
      status: 'available',
      campaign: {
        status: 'approved',
      },
    };

    if (campaignId) {
      where.campaignId = campaignId;
    }

    return prisma.task.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
            taskReward: true,
            creator: {
              select: {
                id: true,
                displayName: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Получение задач амбассадора
   */
  async getAmbassadorTasks(ambassadorId: string, status?: TaskStatus) {
    const where: Prisma.TaskWhereInput = {
      ambassadorId,
    };

    if (status) {
      where.status = status;
    }

    return prisma.task.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
            taskReward: true,
          },
        },
      },
    });
  }

  /**
   * Взятие задачи (FSM: available → taken)
   */
  async takeTask(ambassadorId: string, taskId: string, idempotencyKey: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        campaign: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Проверка FSM
    if (task.status !== 'available') {
      throw new BadRequestException(`Task is not available. Current status: ${task.status}`);
    }

    // Проверка статуса кампании
    if (task.campaign.status !== 'approved') {
      throw new BadRequestException('Campaign is not approved');
    }

    // Резервируем вознаграждение
    await this.financeService.reserve({
      userId: task.campaign.creatorId,
      amount: task.campaign.taskReward.toString(),
      description: `Резервирование вознаграждения за задание: ${task.title}`,
      idempotencyKey,
      relatedEntityType: 'task',
      relatedEntityId: taskId,
    });

    // Обновляем задачу
    const updated = await prisma.task.update({
      where: { id: taskId },
       {
        status: 'taken',
        ambassadorId,
        takenAt: new Date(),
        dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 дней на выполнение
      },
    });

    // Добавляем задачу в очередь для проверки просрочки
    await this.taskQueue.add(
      'check-overdue',
      { taskId },
      {
        delay: 7 * 24 * 60 * 60 * 1000, // 7 дней
        jobId: `overdue-${taskId}`,
      },
    );

    // Аудит-лог
    await prisma.auditLog.create({
       {
        userId: ambassadorId,
        action: 'task.taken',
        entityType: 'Task',
        entityId: taskId,
        after: {
          status: updated.status,
          ambassadorId,
          dueAt: updated.dueAt,
        },
      },
    });

    this.logger.log(`Task taken: ${taskId} by ambassador ${ambassadorId}`);

    return updated;
  }

  /**
   * Отправка доказательства выполнения (FSM: taken/in_progress → proof_submitted)
   */
  async submitProof(ambassadorId: string, taskId: string, proofData: any, idempotencyKey: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.ambassadorId !== ambassadorId) {
      throw new ForbiddenException('You can only submit proof for your own tasks');
    }

    // Проверка FSM
    if (task.status !== 'taken' && task.status !== 'in_progress') {
      throw new BadRequestException(`Cannot submit proof. Current status: ${task.status}`);
    }

    // Обновляем задачу
    const updated = await prisma.task.update({
      where: { id: taskId },
       {
        status: 'proof_submitted',
        proofData,
        submittedAt: new Date(),
      },
    });

    // Добавляем в очередь модерации
    await prisma.moderationQueue.create({
       {
        entityType: 'task',
        entityId: taskId,
        status: 'pending',
        priority: 0,
      },
    });

    // Аудит-лог
    await prisma.auditLog.create({
       {
        userId: ambassadorId,
        action: 'task.proof_submitted',
        entityType: 'Task',
        entityId: taskId,
        before: { status: task.status },
        after: {
          status: updated.status,
          proofData,
        },
      },
    });

    this.logger.log(`Task proof submitted: ${taskId} by ambassador ${ambassadorId}`);

    return updated;
  }

  /**
   * Одобрение задачи (FSM: proof_submitted → approved)
   */
  async approveTask(moderatorId: string, taskId: string, reviewNotes: string | undefined, idempotencyKey: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        campaign: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.status !== 'proof_submitted') {
      throw new BadRequestException(`Task must be in proof_submitted status. Current: ${task.status}`);
    }

    // Обновляем задачу
    const updated = await prisma.task.update({
      where: { id: taskId },
       {
        status: 'approved',
        reviewNotes,
        reviewedBy: moderatorId,
        reviewedAt: new Date(),
      },
    });

    // Начисляем вознаграждение амбассадору
    await this.financeService.reward({
      userId: task.ambassadorId!,
      amount: task.campaign.taskReward.toString(),
      description: `Вознаграждение за выполнение задания: ${task.title}`,
      idempotencyKey,
      relatedEntityType: 'task',
      relatedEntityId: taskId,
    });

    // Освобождаем резерв креатора
    await this.financeService.release({
      userId: task.campaign.creatorId,
      amount: task.campaign.taskReward.toString(),
      description: `Освобождение резерва за выполненное задание: ${task.title}`,
      idempotencyKey: uuidv4(), // Новый ключ для освобождения
      relatedEntityType: 'task',
      relatedEntityId: taskId,
    });

    // Обновляем очередь модерации
    await prisma.moderationQueue.updateMany({
      where: {
        entityType: 'task',
        entityId: taskId,
      },
       {
        status: 'approved',
        assignedTo: moderatorId,
        reviewedAt: new Date(),
        decision: 'approved',
        decisionReason: reviewNotes,
      },
    });

    // Обновляем статистику амбассадора
    await prisma.ambassadorProfile.update({
      where: { userId: task.ambassadorId! },
       {
        completedTasks: {
          increment: 1,
        },
      },
    });

    // Аудит-лог
    await prisma.auditLog.create({
       {
        userId: moderatorId,
        action: 'task.approved',
        entityType: 'Task',
        entityId: taskId,
        before: { status: task.status },
        after: {
          status: updated.status,
          reward: task.campaign.taskReward.toString(),
        },
      },
    });

    this.logger.log(`Task approved: ${taskId} by moderator ${moderatorId}`);

    return updated;
  }

  /**
   * Отклонение задачи (FSM: proof_submitted → rejected)
   */
  async rejectTask(moderatorId: string, taskId: string, reviewNotes: string, idempotencyKey: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        campaign: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.status !== 'proof_submitted') {
      throw new BadRequestException(`Task must be in proof_submitted status. Current: ${task.status}`);
    }

    // Обновляем задачу
    const updated = await prisma.task.update({
      where: { id: taskId },
       {
        status: 'rejected',
        reviewNotes,
        reviewedBy: moderatorId,
        reviewedAt: new Date(),
      },
    });

    // Освобождаем резерв креатора
    await this.financeService.release({
      userId: task.campaign.creatorId,
      amount: task.campaign.taskReward.toString(),
      description: `Возврат резерва за отклонённое задание: ${task.title}`,
      idempotencyKey,
      relatedEntityType: 'task',
      relatedEntityId: taskId,
    });

    // Обновляем очередь модерации
    await prisma.moderationQueue.updateMany({
      where: {
        entityType: 'task',
        entityId: taskId,
      },
       {
        status: 'rejected',
        assignedTo: moderatorId,
        reviewedAt: new Date(),
        decision: 'rejected',
        decisionReason: reviewNotes,
      },
    });

    // Аудит-лог
    await prisma.auditLog.create({
       {
        userId: moderatorId,
        action: 'task.rejected',
        entityType: 'Task',
        entityId: taskId,
        before: { status: task.status },
        after: {
          status: updated.status,
          reason: reviewNotes,
        },
      },
    });

    this.logger.log(`Task rejected: ${taskId} by moderator ${moderatorId}`);

    return updated;
  }

  /**
   * Обработка просроченной задачи
   */
  async handleOverdueTask(taskId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        campaign: true,
      },
    });

    if (!task) {
      this.logger.warn(`Task not found for overdue check: ${taskId}`);
      return;
    }

    // Проверяем, что задача всё ещё в статусе taken/in_progress
    if (task.status !== 'taken' && task.status !== 'in_progress') {
      this.logger.log(`Task ${taskId} is no longer in progress, skipping overdue check`);
      return;
    }

    // Проверяем, что задача действительно просрочена
    if (task.dueAt && task.dueAt > new Date()) {
      this.logger.log(`Task ${taskId} is not yet overdue`);
      return;
    }

    // Обновляем статус задачи
    await prisma.task.update({
      where: { id: taskId },
       {
        status: 'overdue',
      },
    });

    // Освобождаем резерв креатора
    await this.financeService.release({
      userId: task.campaign.creatorId,
      amount: task.campaign.taskReward.toString(),
      description: `Возврат резерва за просроченное задание: ${task.title}`,
      idempotencyKey: uuidv4(),
      relatedEntityType: 'task',
      relatedEntityId: taskId,
    });

    // Ухудшаем рейтинг амбассадора
    if (task.ambassadorId) {
      const ambassador = await prisma.ambassadorProfile.findUnique({
        where: { userId: task.ambassadorId },
      });

      if (ambassador && ambassador.rating) {
        const newRating = Math.max(0, Number(ambassador.rating) - 0.1);
        await prisma.ambassadorProfile.update({
          where: { userId: task.ambassadorId },
           {
            rating: newRating,
          },
        });

        this.logger.log(`Ambassador ${task.ambassadorId} rating decreased to ${newRating} due to overdue task ${taskId}`);
      }
    }

    // Аудит-лог
    await prisma.auditLog.create({
       {
        action: 'task.overdue',
        entityType: 'Task',
        entityId: taskId,
        after: {
          status: 'overdue',
          ambassadorId: task.ambassadorId,
        },
      },
    });

    this.logger.log(`Task marked as overdue: ${taskId}`);
  }
}
