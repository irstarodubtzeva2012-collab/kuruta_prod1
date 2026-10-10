import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Prisma, CampaignStatus } from '@prisma/client';
import { prisma } from '@kuruta/database';
import { FinanceService } from '../finance/finance.service';
import { CreateCampaignDto, UpdateCampaignDto } from './dto/campaign.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CampaignsService {
  private readonly logger = new Logger(CampaignsService.name);

  constructor(private readonly financeService: FinanceService) {}

  /**
   * Создание кампании
   */
  async createCampaign(creatorId: string, dto: CreateCampaignDto) {
    const campaign = await prisma.campaign.create({
       {
        creatorId,
        title: dto.title,
        description: dto.description,
        budget: new Prisma.Decimal(dto.budget),
        taskCount: dto.taskCount,
        taskReward: new Prisma.Decimal(dto.taskReward),
        requirements: dto.requirements,
        targetAudience: dto.targetAudience,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
        status: CampaignStatus.draft,
      },
    });

    // Создаём задания
    const tasks = [];
    for (let i = 0; i < dto.taskCount; i++) {
      const task = await prisma.task.create({
         {
          campaignId: campaign.id,
          title: `${dto.title} - Задание ${i + 1}`,
          description: dto.description,
          status: 'available',
        },
      });
      tasks.push(task);
    }

    // Аудит-лог
    await prisma.auditLog.create({
       {
        userId: creatorId,
        action: 'campaign.created',
        entityType: 'Campaign',
        entityId: campaign.id,
        after: {
          title: campaign.title,
          budget: dto.budget,
          taskCount: dto.taskCount,
        },
      },
    });

    this.logger.log(`Campaign created: ${campaign.id} by user ${creatorId}`);

    return {
      campaign,
      tasks,
    };
  }

  /**
   * Получение кампании
   */
  async getCampaign(campaignId: string) {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        creator: {
          select: {
            id: true,
            displayName: true,
          },
        },
        tasks: {
          include: {
            ambassador: {
              select: {
                id: true,
                displayName: true,
              },
            },
          },
        },
      },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    return campaign;
  }

  /**
   * Получение списка кампаний пользователя
   */
  async getUserCampaigns(userId: string, status?: CampaignStatus) {
    const where: Prisma.CampaignWhereInput = {
      creatorId: userId,
    };

    if (status) {
      where.status = status;
    }

    return prisma.campaign.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });
  }

  /**
   * Обновление кампании (только в статусе draft)
   */
  async updateCampaign(creatorId: string, campaignId: string, dto: UpdateCampaignDto) {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    if (campaign.creatorId !== creatorId) {
      throw new ForbiddenException('You can only update your own campaigns');
    }

    if (campaign.status !== CampaignStatus.draft) {
      throw new BadRequestException('Can only update campaigns in draft status');
    }

    const updated = await prisma.campaign.update({
      where: { id: campaignId },
       {
        ...dto,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
      },
    });

    // Аудит-лог
    await prisma.auditLog.create({
       {
        userId: creatorId,
        action: 'campaign.updated',
        entityType: 'Campaign',
        entityId: campaignId,
        before: campaign,
        after: updated,
      },
    });

    return updated;
  }

  /**
   * Оплата кампании (резервирование средств)
   */
  async payCampaign(creatorId: string, campaignId: string, idempotencyKey: string) {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    if (campaign.creatorId !== creatorId) {
      throw new ForbiddenException('You can only pay for your own campaigns');
    }

    if (campaign.status !== CampaignStatus.draft) {
      throw new BadRequestException('Can only pay for campaigns in draft status');
    }

    // Резервируем средства через FinanceService
    await this.financeService.reserve({
      userId: creatorId,
      amount: campaign.budget.toString(),
      description: `Резервирование средств для кампании: ${campaign.title}`,
      idempotencyKey,
      relatedEntityType: 'campaign',
      relatedEntityId: campaignId,
    });

    // Обновляем статус кампании
    const updated = await prisma.campaign.update({
      where: { id: campaignId },
       {
        status: CampaignStatus.awaiting_payment,
      },
    });

    // Аудит-лог
    await prisma.auditLog.create({
       {
        userId: creatorId,
        action: 'campaign.paid',
        entityType: 'Campaign',
        entityId: campaignId,
        after: {
          status: updated.status,
          budget: campaign.budget.toString(),
        },
      },
    });

    this.logger.log(`Campaign paid: ${campaignId}, budget: ${campaign.budget}`);

    return updated;
  }

  /**
   * Отправка кампании на модерацию
   */
  async submitForModeration(creatorId: string, campaignId: string, idempotencyKey: string) {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    if (campaign.creatorId !== creatorId) {
      throw new ForbiddenException('You can only submit your own campaigns');
    }

    if (campaign.status !== CampaignStatus.awaiting_payment) {
      throw new BadRequestException('Campaign must be paid before moderation');
    }

    // Обновляем статус
    const updated = await prisma.campaign.update({
      where: { id: campaignId },
       {
        status: CampaignStatus.pending_review,
      },
    });

    // Добавляем в очередь модерации
    await prisma.moderationQueue.create({
       {
        entityType: 'campaign',
        entityId: campaignId,
        status: 'pending',
        priority: 0,
      },
    });

    // Аудит-лог
    await prisma.auditLog.create({
       {
        userId: creatorId,
        action: 'campaign.submitted_for_moderation',
        entityType: 'Campaign',
        entityId: campaignId,
        after: {
          status: updated.status,
        },
      },
    });

    this.logger.log(`Campaign submitted for moderation: ${campaignId}`);

    return updated;
  }

  /**
   * Одобрение кампании (модератором)
   */
  async approveCampaign(moderatorId: string, campaignId: string, idempotencyKey: string) {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    if (campaign.status !== CampaignStatus.pending_review) {
      throw new BadRequestException('Campaign must be in pending_review status');
    }

    // Обновляем статус кампании
    const updated = await prisma.campaign.update({
      where: { id: campaignId },
       {
        status: CampaignStatus.approved,
      },
    });

    // Обновляем очередь модерации
    await prisma.moderationQueue.updateMany({
      where: {
        entityType: 'campaign',
        entityId: campaignId,
      },
       {
        status: 'approved',
        assignedTo: moderatorId,
        reviewedAt: new Date(),
        decision: 'approved',
      },
    });

    // Аудит-лог
    await prisma.auditLog.create({
       {
        userId: moderatorId,
        action: 'campaign.approved',
        entityType: 'Campaign',
        entityId: campaignId,
        before: { status: campaign.status },
        after: { status: updated.status },
      },
    });

    this.logger.log(`Campaign approved: ${campaignId} by moderator ${moderatorId}`);

    return updated;
  }

  /**
   * Отклонение кампании (модератором)
   */
  async rejectCampaign(moderatorId: string, campaignId: string, reason: string, idempotencyKey: string) {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    if (campaign.status !== CampaignStatus.pending_review) {
      throw new BadRequestException('Campaign must be in pending_review status');
    }

    // Обновляем статус кампании
    const updated = await prisma.campaign.update({
      where: { id: campaignId },
       {
        status: CampaignStatus.cancelled,
      },
    });

    // Возвращаем средства (освобождаем резерв)
    await this.financeService.release({
      userId: campaign.creatorId,
      amount: campaign.budget.toString(),
      description: `Возврат средств за отклонённую кампанию: ${campaign.title}`,
      idempotencyKey,
      relatedEntityType: 'campaign',
      relatedEntityId: campaignId,
    });

    // Обновляем очередь модерации
    await prisma.moderationQueue.updateMany({
      where: {
        entityType: 'campaign',
        entityId: campaignId,
      },
       {
        status: 'rejected',
        assignedTo: moderatorId,
        reviewedAt: new Date(),
        decision: 'rejected',
        decisionReason: reason,
      },
    });

    // Аудит-лог
    await prisma.auditLog.create({
       {
        userId: moderatorId,
        action: 'campaign.rejected',
        entityType: 'Campaign',
        entityId: campaignId,
        before: { status: campaign.status },
        after: { status: updated.status, reason },
      },
    });

    this.logger.log(`Campaign rejected: ${campaignId} by moderator ${moderatorId}, reason: ${reason}`);

    return updated;
  }

  /**
   * Подбор амбассадоров по требованиям кампании
   */
  async findAmbassadors(campaignId: string, filters?: {
    niches?: string[];
    minAudienceSize?: number;
    geo?: string[];
    limit?: number;
  }) {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    const where: Prisma.AmbassadorProfileWhereInput = {
      isVerified: true,
    };

    if (filters?.niches && filters.niches.length > 0) {
      where.niches = {
        hasSome: filters.niches,
      };
    }

    if (filters?.minAudienceSize) {
      where.audienceSize = {
        gte: filters.minAudienceSize,
      };
    }

    // TODO: Добавить фильтрацию по гео после реализации поля в AmbassadorProfile

    const ambassadors = await prisma.ambassadorProfile.findMany({
      where,
      orderBy: {
        rating: 'desc',
      },
      take: filters?.limit || 20,
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            email: true,
          },
        },
      },
    });

    return ambassadors;
  }
}
