import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Prisma, AdSlotStatus } from '@prisma/client';
import { prisma } from '@kuruta/database';
import { CreateAdSlotDto, UpdateAdSlotDto, CatalogFilterDto } from './dto/ad-slot.dto';

@Injectable()
export class AdSlotsService {
  private readonly logger = new Logger(AdSlotsService.name);

  /**
   * Создание рекламного места
   */
  async createAdSlot(ownerId: string, dto: CreateAdSlotDto) {
    // Проверяем, что пользователь является владельцем платформы
    const platform = await prisma.platform.findFirst({
      where: {
        id: dto.platformId,
        ownerId: ownerId,
      },
    });

    if (!platform) {
      throw new ForbiddenException('You can only create slots for your own platforms');
    }

    const adSlot = await prisma.adSlot.create({
       {
        platformId: dto.platformId,
        ownerId,
        title: dto.title,
        description: dto.description,
        pricePerDay: new Prisma.Decimal(dto.price),
        format: dto.format,
        duration: dto.duration.toString(),
        availability: dto.availability,
        requirements: dto.requirements,
        status: AdSlotStatus.draft,
      },
    });

    // Аудит-лог
    await prisma.auditLog.create({
       {
        userId: ownerId,
        action: 'ad_slot.created',
        entityType: 'AdSlot',
        entityId: adSlot.id,
        after: {
          title: adSlot.title,
          price: dto.price,
          platformId: dto.platformId,
        },
      },
    });

    this.logger.log(`Ad slot created: ${adSlot.id} by owner ${ownerId}`);

    return adSlot;
  }

  /**
   * Получение рекламного места
   */
  async getAdSlot(adSlotId: string) {
    const adSlot = await prisma.adSlot.findUnique({
      where: { id: adSlotId },
      include: {
        platform: {
          include: {
            owner: {
              select: {
                id: true,
                displayName: true,
              },
            },
          },
        },
        owner: {
          select: {
            id: true,
            displayName: true,
          },
        },
        deals: {
          where: {
            status: {
              in: ['created', 'paid', 'in_progress', 'confirming'],
            },
          },
        },
      },
    });

    if (!adSlot) {
      throw new NotFoundException('Ad slot not found');
    }

    return adSlot;
  }

  /**
   * Получение списка рекламных мест владельца
   */
  async getOwnerAdSlots(ownerId: string, status?: AdSlotStatus) {
    const where: Prisma.AdSlotWhereInput = {
      ownerId,
    };

    if (status) {
      where.status = status;
    }

    return prisma.adSlot.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        platform: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        _count: {
          select: {
            deals: true,
          },
        },
      },
    });
  }

  /**
   * Обновление рекламного места (только в статусе draft)
   */
  async updateAdSlot(ownerId: string, adSlotId: string, dto: UpdateAdSlotDto) {
    const adSlot = await prisma.adSlot.findUnique({
      where: { id: adSlotId },
    });

    if (!adSlot) {
      throw new NotFoundException('Ad slot not found');
    }

    if (adSlot.ownerId !== ownerId) {
      throw new ForbiddenException('You can only update your own ad slots');
    }

    if (adSlot.status !== AdSlotStatus.draft) {
      throw new BadRequestException('Can only update ad slots in draft status');
    }

    const updated = await prisma.adSlot.update({
      where: { id: adSlotId },
       {
        ...dto,
      },
    });

    // Аудит-лог
    await prisma.auditLog.create({
       {
        userId: ownerId,
        action: 'ad_slot.updated',
        entityType: 'AdSlot',
        entityId: adSlotId,
        before: adSlot,
        after: updated,
      },
    });

    return updated;
  }

  /**
   * Отправка на модерацию
   */
  async submitForModeration(ownerId: string, adSlotId: string) {
    const adSlot = await prisma.adSlot.findUnique({
      where: { id: adSlotId },
    });

    if (!adSlot) {
      throw new NotFoundException('Ad slot not found');
    }

    if (adSlot.ownerId !== ownerId) {
      throw new ForbiddenException('You can only submit your own ad slots');
    }

    if (adSlot.status !== AdSlotStatus.draft) {
      throw new BadRequestException('Can only submit ad slots in draft status');
    }

    const updated = await prisma.adSlot.update({
      where: { id: adSlotId },
       {
        status: AdSlotStatus.pending_review,
      },
    });

    // Добавляем в очередь модерации
    await prisma.moderationQueue.create({
       {
        entityType: 'ad_slot',
        entityId: adSlotId,
        status: 'pending',
        priority: 0,
      },
    });

    // Аудит-лог
    await prisma.auditLog.create({
       {
        userId: ownerId,
        action: 'ad_slot.submitted_for_moderation',
        entityType: 'AdSlot',
        entityId: adSlotId,
        after: {
          status: updated.status,
        },
      },
    });

    this.logger.log(`Ad slot submitted for moderation: ${adSlotId}`);

    return updated;
  }

  /**
   * Одобрение рекламного места (модератором)
   */
  async approveAdSlot(moderatorId: string, adSlotId: string) {
    const adSlot = await prisma.adSlot.findUnique({
      where: { id: adSlotId },
    });

    if (!adSlot) {
      throw new NotFoundException('Ad slot not found');
    }

    if (adSlot.status !== AdSlotStatus.pending_review) {
      throw new BadRequestException('Ad slot must be in pending_review status');
    }

    const updated = await prisma.adSlot.update({
      where: { id: adSlotId },
       {
        status: AdSlotStatus.published,
      },
    });

    // Обновляем очередь модерации
    await prisma.moderationQueue.updateMany({
      where: {
        entityType: 'ad_slot',
        entityId: adSlotId,
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
        action: 'ad_slot.approved',
        entityType: 'AdSlot',
        entityId: adSlotId,
        before: { status: adSlot.status },
        after: { status: updated.status },
      },
    });

    this.logger.log(`Ad slot approved: ${adSlotId} by moderator ${moderatorId}`);

    return updated;
  }

  /**
   * Отклонение рекламного места (модератором)
   */
  async rejectAdSlot(moderatorId: string, adSlotId: string, reason: string) {
    const adSlot = await prisma.adSlot.findUnique({
      where: { id: adSlotId },
    });

    if (!adSlot) {
      throw new NotFoundException('Ad slot not found');
    }

    if (adSlot.status !== AdSlotStatus.pending_review) {
      throw new BadRequestException('Ad slot must be in pending_review status');
    }

    const updated = await prisma.adSlot.update({
      where: { id: adSlotId },
       {
        status: AdSlotStatus.closed,
      },
    });

    // Обновляем очередь модерации
    await prisma.moderationQueue.updateMany({
      where: {
        entityType: 'ad_slot',
        entityId: adSlotId,
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
        action: 'ad_slot.rejected',
        entityType: 'AdSlot',
        entityId: adSlotId,
        before: { status: adSlot.status },
        after: { status: updated.status, reason },
      },
    });

    this.logger.log(`Ad slot rejected: ${adSlotId} by moderator ${moderatorId}`);

    return updated;
  }

  /**
   * ЕДИНЫЙ МАРКЕТПЛЕЙС: Публичный каталог с фильтрацией собственных слотов
   * Если пользователь является владельцем, его слоты исключаются из выдачи
   */
  async getCatalog(userId: string | null, filters?: CatalogFilterDto) {
    const where: Prisma.AdSlotWhereInput = {
      status: AdSlotStatus.published,
    };

    // КРИТИЧНО: Если пользователь авторизован, исключаем его собственные слоты
    if (userId) {
      // Проверяем, является ли пользователь владельцем площадок
      const isOwner = await prisma.platformOwnerProfile.findUnique({
        where: { userId },
      });

      if (isOwner) {
        // Исключаем слоты этого владельца
        where.ownerId = {
          not: userId,
        };
      }
    }

    // Применяем фильтры
    if (filters?.platformType) {
      where.platform = {
        type: filters.platformType,
      };
    }

    if (filters?.minPrice || filters?.maxPrice) {
      where.pricePerDay = {};
      if (filters.minPrice) {
        where.pricePerDay.gte = new Prisma.Decimal(filters.minPrice);
      }
      if (filters.maxPrice) {
        where.pricePerDay.lte = new Prisma.Decimal(filters.maxPrice);
      }
    }

    if (filters?.minAudienceSize) {
      where.platform = {
        ...where.platform,
        audienceSize: {
          gte: filters.minAudienceSize,
        },
      };
    }

    if (filters?.format) {
      where.format = filters.format;
    }

    const [adSlots, total] = await Promise.all([
      prisma.adSlot.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: filters?.limit || 20,
        skip: filters?.offset || 0,
        include: {
          platform: {
            select: {
              id: true,
              name: true,
              type: true,
              audienceSize: true,
              audienceGeo: true,
            },
          },
          owner: {
            select: {
              id: true,
              displayName: true,
              rating: true,
            },
          },
          _count: {
            select: {
              deals: {
                where: {
                  status: {
                    in: ['completed'],
                  },
                },
              },
            },
          },
        },
      }),
      prisma.adSlot.count({ where }),
    ]);

    return {
      items: adSlots,
      total,
      limit: filters?.limit || 20,
      offset: filters?.offset || 0,
    };
  }

  /**
   * Проверка доступности слота на указанные даты
   */
  async checkAvailability(adSlotId: string, startDate: Date, endDate: Date) {
    const adSlot = await prisma.adSlot.findUnique({
      where: { id: adSlotId },
      include: {
        deals: {
          where: {
            status: {
              in: ['created', 'paid', 'in_progress', 'confirming'],
            },
            OR: [
              {
                startDate: { lte: endDate },
                endDate: { gte: startDate },
              },
            ],
          },
        },
      },
    });

    if (!adSlot) {
      throw new NotFoundException('Ad slot not found');
    }

    // Если есть пересекающиеся бронирования - слот занят
    const isAvailable = adSlot.deals.length === 0;

    return {
      available: isAvailable,
      adSlot,
    };
  }
}
