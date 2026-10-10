import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Prisma, DisputeStatus } from '@prisma/client';
import { prisma } from '@kuruta/database';
import { FinanceService } from '../finance/finance.service';
import { OpenDisputeDto, ResolveDisputeDto, DisputeResolution } from './dto/disputes.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DisputesService {
  private readonly logger = new Logger(DisputesService.name);

  constructor(private readonly financeService: FinanceService) {}

  /**
   * Открытие спора
   * Блокирует сделку/задачу до разрешения
   */
  async openDispute(userId: string, dto: OpenDisputeDto) {
    return prisma.$transaction(async (tx) => {
      // Проверяем, что пользователь участвует в сделке/задаче
      let relatedEntity: any;
      let amount: any;
      let otherPartyId: string;

      if (dto.entityType === 'deal') {
        const deal = await tx.deal.findUnique({
          where: { id: dto.entityId },
          include: { adSlot: true },
        });

        if (!deal) {
          throw new NotFoundException('Deal not found');
        }

        // Проверяем, что пользователь участвует в сделке
        if (deal.buyerId !== userId && deal.adSlot.ownerId !== userId) {
          throw new ForbiddenException('You are not a party to this deal');
        }

        // Нельзя открыть спор, если сделка уже завершена или оспорена
        if (['completed', 'disputed', 'cancelled'].includes(deal.status)) {
          throw new BadRequestException(`Cannot open dispute for deal in status: ${deal.status}`);
        }

        // Блокируем сделку
        await tx.deal.update({
          where: { id: dto.entityId },
           { status: 'disputed' },
        });

        relatedEntity = deal;
        amount = deal.totalAmount;
        otherPartyId = deal.buyerId === userId ? deal.adSlot.ownerId : deal.buyerId;
      } else if (dto.entityType === 'task') {
        const task = await tx.task.findUnique({
          where: { id: dto.entityId },
          include: { campaign: true },
        });

        if (!task) {
          throw new NotFoundException('Task not found');
        }

        // Проверяем, что пользователь участвует в задаче
        if (task.ambassadorId !== userId && task.campaign.creatorId !== userId) {
          throw new ForbiddenException('You are not a party to this task');
        }

        // Нельзя открыть спор, если задача уже завершена или оспорена
        if (['paid', 'disputed', 'cancelled', 'overdue'].includes(task.status)) {
          throw new BadRequestException(`Cannot open dispute for task in status: ${task.status}`);
        }

        // Блокируем задачу
        await tx.task.update({
          where: { id: dto.entityId },
           { status: 'disputed' },
        });

        relatedEntity = task;
        amount = task.campaign.taskReward;
        otherPartyId = task.ambassadorId === userId ? task.campaign.creatorId : task.ambassadorId;
      } else {
        throw new BadRequestException('Invalid entity type');
      }

      // Создаём спор
      const dispute = await tx.dispute.create({
         {
          openedBy: userId,
          relatedType: dto.entityType,
          relatedId: dto.entityId,
          status: 'opened',
          reason: dto.reason,
          description: dto.details,
          evidence: dto.evidence,
        },
      });

      // Добавляем в очередь модерации
      await tx.moderationQueue.create({
         {
          entityType: 'dispute',
          entityId: dispute.id,
          status: 'pending',
          priority: 10, // Высокий приоритет для споров
        },
      });

      // Аудит-лог
      await tx.auditLog.create({
         {
          userId,
          action: 'dispute.opened',
          entityType: 'Dispute',
          entityId: dispute.id,
          after: {
            relatedType: dto.entityType,
            relatedId: dto.entityId,
            reason: dto.reason,
            amount: amount.toString(),
          },
        },
      });

      this.logger.log(`Dispute opened: ${dispute.id} by user ${userId} for ${dto.entityType} ${dto.entityId}`);

      return dispute;
    });
  }

  /**
   * Разрешение спора модератором
   * Вызывает распределение денег через FinanceService
   */
  async resolveDispute(moderatorId: string, disputeId: string, dto: ResolveDisputeDto) {
    return prisma.$transaction(async (tx) => {
      const dispute = await tx.dispute.findUnique({
        where: { id: disputeId },
      });

      if (!dispute) {
        throw new NotFoundException('Dispute not found');
      }

      if (dispute.status !== 'opened' && dispute.status !== 'investigating') {
        throw new BadRequestException(`Cannot resolve dispute in status: ${dispute.status}`);
      }

      // Получаем связанную сущность
      let relatedEntity: any;
      let amount: any;
      let creatorId: string;
      let executorId: string;

      if (dispute.relatedType === 'deal') {
        const deal = await tx.deal.findUnique({
          where: { id: dispute.relatedId },
          include: { adSlot: true },
        });

        if (!deal) {
          throw new NotFoundException('Related deal not found');
        }

        relatedEntity = deal;
        amount = deal.totalAmount;
        creatorId = deal.buyerId;
        executorId = deal.adSlot.ownerId;
      } else if (dispute.relatedType === 'task') {
        const task = await tx.task.findUnique({
          where: { id: dispute.relatedId },
          include: { campaign: true },
        });

        if (!task) {
          throw new NotFoundException('Related task not found');
        }

        relatedEntity = task;
        amount = task.campaign.taskReward;
        creatorId = task.campaign.creatorId;
        executorId = task.ambassadorId;
      } else {
        throw new BadRequestException('Invalid related type');
      }

      // Определяем статус спора и распределение денег
      let disputeStatus: DisputeStatus;
      let creatorRefund = 0;
      let executorPayout = 0;

      switch (dto.resolution) {
        case DisputeResolution.IN_FAVOR_OF_CREATOR:
          // Полный возврат креатору
          disputeStatus = 'resolved_creator';
          creatorRefund = Number(amount.toString());
          executorPayout = 0;
          break;

        case DisputeResolution.IN_FAVOR_OF_EXECUTOR:
          // Полная выплата исполнителю
          disputeStatus = 'resolved_executor';
          creatorRefund = 0;
          executorPayout = Number(amount.toString());
          break;

        case DisputeResolution.PARTIAL_REFUND:
          // Частичный возврат
          if (!dto.refundPercentage || dto.refundPercentage < 0 || dto.refundPercentage > 100) {
            throw new BadRequestException('Invalid refund percentage');
          }
          disputeStatus = 'resolved_partial';
          creatorRefund = Number(amount.toString()) * (dto.refundPercentage / 100);
          executorPayout = Number(amount.toString()) - creatorRefund;
          break;

        default:
          throw new BadRequestException('Invalid resolution');
      }

      // Обновляем спор
      const updatedDispute = await tx.dispute.update({
        where: { id: disputeId },
         {
          status: disputeStatus,
          resolution: dto.resolution,
          resolvedBy: moderatorId,
          resolvedAt: new Date(),
        },
      });

      // Распределяем деньги через FinanceService
      if (creatorRefund > 0) {
        // Возврат креатору
        await this.financeService.refund({
          userId: creatorId,
          originalTransactionId: dispute.relatedId,
          amount: creatorRefund.toString(),
          description: `Возврат по спору #${disputeId}: ${dto.comment}`,
          idempotencyKey: uuidv4(),
        });
      }

      if (executorPayout > 0) {
        // Выплата исполнителю
        await this.financeService.reward({
          userId: executorId,
          amount: executorPayout.toString(),
          description: `Выплата по спору #${disputeId}: ${dto.comment}`,
          idempotencyKey: uuidv4(),
          relatedEntityType: dispute.relatedType,
          relatedEntityId: dispute.relatedId,
        });
      }

      // Обновляем статус связанной сущности
      if (dispute.relatedType === 'deal') {
        await tx.deal.update({
          where: { id: dispute.relatedId },
           { status: 'cancelled' },
        });
      } else if (dispute.relatedType === 'task') {
        await tx.task.update({
          where: { id: dispute.relatedId },
           { status: 'cancelled' },
        });
      }

      // Обновляем очередь модерации
      await tx.moderationQueue.updateMany({
        where: {
          entityType: 'dispute',
          entityId: disputeId,
        },
         {
          status: 'approved',
          assignedTo: moderatorId,
          reviewedAt: new Date(),
          decision: dto.resolution,
          decisionReason: dto.comment,
        },
      });

      // Аудит-лог
      await tx.auditLog.create({
         {
          userId: moderatorId,
          action: 'dispute.resolved',
          entityType: 'Dispute',
          entityId: disputeId,
          before: { status: dispute.status },
          after: {
            status: disputeStatus,
            resolution: dto.resolution,
            creatorRefund,
            executorPayout,
          },
        },
      });

      this.logger.log(`Dispute resolved: ${disputeId} by moderator ${moderatorId}, resolution: ${dto.resolution}`);

      return {
        dispute: updatedDispute,
        distribution: {
          creatorRefund,
          executorPayout,
        },
      };
    });
  }

  /**
   * Получение спора
   */
  async getDispute(disputeId: string) {
    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        opener: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    return dispute;
  }

  /**
   * Получение списка споров пользователя
   */
  async getUserDisputes(userId: string) {
    return prisma.dispute.findMany({
      where: {
        OR: [
          { openedBy: userId },
          { resolvedBy: userId },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Получение всех споров (для модераторов)
   */
  async getAllDisputes(status?: DisputeStatus) {
    const where: Prisma.DisputeWhereInput = {};

    if (status) {
      where.status = status;
    }

    return prisma.dispute.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        opener: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    });
  }
}
