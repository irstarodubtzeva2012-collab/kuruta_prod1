import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { prisma } from '@kuruta/database';
import { CampaignsService } from './campaigns.service';
import { TasksService } from './tasks.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ModerationService {
  private readonly logger = new Logger(ModerationService.name);

  constructor(
    private readonly campaignsService: CampaignsService,
    private readonly tasksService: TasksService,
  ) {}

  /**
   * Получение очереди модерации
   */
  async getModerationQueue(filters?: {
    entityType?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: Prisma.ModerationQueueWhereInput = {};

    if (filters?.entityType) {
      where.entityType = filters.entityType as any;
    }

    if (filters?.status) {
      where.status = filters.status as any;
    }

    const [items, total] = await Promise.all([
      prisma.moderationQueue.findMany({
        where,
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'asc' },
        ],
        take: filters?.limit || 50,
        skip: filters?.offset || 0,
      }),
      prisma.moderationQueue.count({ where }),
    ]);

    return {
      items,
      total,
      limit: filters?.limit || 50,
      offset: filters?.offset || 0,
    };
  }

  /**
   * Одобрение элемента очереди
   */
  async approveItem(moderatorId: string, entityId: string, entityType: string, reviewNotes?: string) {
    const idempotencyKey = uuidv4();

    if (entityType === 'campaign') {
      return this.campaignsService.approveCampaign(moderatorId, entityId, idempotencyKey);
    } else if (entityType === 'task') {
      return this.tasksService.approveTask(moderatorId, entityId, reviewNotes, idempotencyKey);
    } else {
      throw new BadRequestException(`Unknown entity type: ${entityType}`);
    }
  }

  /**
   * Отклонение элемента очереди
   */
  async rejectItem(moderatorId: string, entityId: string, entityType: string, reason: string) {
    const idempotencyKey = uuidv4();

    if (entityType === 'campaign') {
      return this.campaignsService.rejectCampaign(moderatorId, entityId, reason, idempotencyKey);
    } else if (entityType === 'task') {
      return this.tasksService.rejectTask(moderatorId, entityId, reason, idempotencyKey);
    } else {
      throw new BadRequestException(`Unknown entity type: ${entityType}`);
    }
  }
}
