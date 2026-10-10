import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { prisma } from '@kuruta/database';
import { GetModerationQueueDto, ModerateItemDto, ModerationStatus } from './dto/moderation.dto';

@Injectable()
export class ModerationService {
  private readonly logger = new Logger(ModerationService.name);

  /**
   * Получение очереди модерации
   */
  async getQueue(filters: GetModerationQueueDto) {
    const where: Prisma.ModerationQueueWhereInput = {};

    if (filters.entityType) {
      where.entityType = filters.entityType;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    const [items, total] = await Promise.all([
      prisma.moderationQueue.findMany({
        where,
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'asc' },
        ],
        take: filters.limit || 20,
        skip: filters.offset || 0,
      }),
      prisma.moderationQueue.count({ where }),
    ]);

    return {
      items,
      total,
      limit: filters.limit || 20,
      offset: filters.offset || 0,
    };
  }

  /**
   * Назначить модератора на задачу
   */
  async assignToModerator(moderatorId: string, queueId: string) {
    const queueItem = await prisma.moderationQueue.findUnique({
      where: { id: queueId },
    });

    if (!queueItem) {
      throw new NotFoundException('Queue item not found');
    }

    if (queueItem.status !== 'pending') {
      throw new BadRequestException('Can only assign pending items');
    }

    const updated = await prisma.moderationQueue.update({
      where: { id: queueId },
       {
        status: 'in_progress',
        assignedTo: moderatorId,
        assignedAt: new Date(),
      },
    });

    // Аудит-лог
    await prisma.auditLog.create({
       {
        userId: moderatorId,
        action: 'moderation.assigned',
        entityType: 'ModerationQueue',
        entityId: queueId,
        after: {
          entityType: queueItem.entityType,
          entityId: queueItem.entityId,
        },
      },
    });

    this.logger.log(`Moderation item ${queueId} assigned to moderator ${moderatorId}`);

    return updated;
  }

  /**
   * Одобрить элемент очереди
   */
  async approve(moderatorId: string, queueId: string, dto: ModerateItemDto) {
    const queueItem = await prisma.moderationQueue.findUnique({
      where: { id: queueId },
    });

    if (!queueItem) {
      throw new NotFoundException('Queue item not found');
    }

    if (queueItem.status !== 'pending' && queueItem.status !== 'in_progress') {
      throw new BadRequestException('Can only approve pending or in_progress items');
    }

    const updated = await prisma.moderationQueue.update({
      where: { id: queueId },
       {
        status: 'approved',
        decision: dto.decision,
        decisionReason: dto.comment,
        reviewedBy: moderatorId,
        reviewedAt: new Date(),
      },
    });

    // Аудит-лог
    await prisma.auditLog.create({
       {
        userId: moderatorId,
        action: 'moderation.approved',
        entityType: 'ModerationQueue',
        entityId: queueId,
        after: {
          entityType: queueItem.entityType,
          entityId: queueItem.entityId,
          decision: dto.decision,
        },
      },
    });

    this.logger.log(`Moderation item ${queueId} approved by moderator ${moderatorId}`);

    return updated;
  }

  /**
   * Отклонить элемент очереди
   */
  async reject(moderatorId: string, queueId: string, dto: ModerateItemDto) {
    const queueItem = await prisma.moderationQueue.findUnique({
      where: { id: queueId },
    });

    if (!queueItem) {
      throw new NotFoundException('Queue item not found');
    }

    if (queueItem.status !== 'pending' && queueItem.status !== 'in_progress') {
      throw new BadRequestException('Can only reject pending or in_progress items');
    }

    const updated = await prisma.moderationQueue.update({
      where: { id: queueId },
       {
        status: 'rejected',
        decision: dto.decision,
        decisionReason: dto.comment,
        reviewedBy: moderatorId,
        reviewedAt: new Date(),
      },
    });

    // Аудит-лог
    await prisma.auditLog.create({
       {
        userId: moderatorId,
        action: 'moderation.rejected',
        entityType: 'ModerationQueue',
        entityId: queueId,
        after: {
          entityType: queueItem.entityType,
          entityId: queueItem.entityId,
          decision: dto.decision,
          reason: dto.comment,
        },
      },
    });

    this.logger.log(`Moderation item ${queueId} rejected by moderator ${moderatorId}`);

    return updated;
  }

  /**
   * Получить статистику модератора
   */
  async getModeratorStats(moderatorId: string) {
    const [totalReviewed, approved, rejected, avgTime] = await Promise.all([
      prisma.moderationQueue.count({
        where: { reviewedBy: moderatorId },
      }),
      prisma.moderationQueue.count({
        where: { reviewedBy: moderatorId, status: 'approved' },
      }),
      prisma.moderationQueue.count({
        where: { reviewedBy: moderatorId, status: 'rejected' },
      }),
      prisma.moderationQueue.aggregate({
        where: { reviewedBy: moderatorId },
        _avg: {
          priority: true,
        },
      }),
    ]);

    return {
      totalReviewed,
      approved,
      rejected,
      approvalRate: totalReviewed > 0 ? (approved / totalReviewed) * 100 : 0,
    };
  }
}
