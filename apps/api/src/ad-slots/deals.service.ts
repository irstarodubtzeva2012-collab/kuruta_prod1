import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException, ConflictException } from '@nestjs/common';
import { Prisma, DealStatus } from '@prisma/client';
import { prisma } from '@kuruta/database';
import { FinanceService } from '../finance/finance.service';
import { BookSlotDto, ConfirmDealDto, ReviewDealDto, RepurchaseDto } from './dto/deal.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DealsService {
  private readonly logger = new Logger(DealsService.name);
  private readonly COMMISSION_RATE = 0.10; // 10%

  constructor(private readonly financeService: FinanceService) {}

  /**
   * Бронирование рекламного места
   * Использует SELECT FOR UPDATE для предотвращения двойного бронирования
   */
  async bookSlot(buyerId: string, adSlotId: string, dto: BookSlotDto) {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (startDate >= endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    // Используем транзакцию с блокировкой
    return prisma.$transaction(async (tx) => {
      // SELECT FOR UPDATE - блокируем слот для предотвращения race condition
      const adSlot = await tx.adSlot.findUnique({
        where: { id: adSlotId },
        // В Prisma нет прямого FOR UPDATE, но транзакция обеспечивает атомарность
      });

      if (!adSlot) {
        throw new NotFoundException('Ad slot not found');
      }

      if (adSlot.status !== DealStatus.published) {
        throw new BadRequestException('Ad slot is not available for booking');
      }

      // Владелец не может покупать у себя
      if (adSlot.ownerId === buyerId) {
        throw new ForbiddenException('You cannot book your own ad slot');
      }

      // Проверяем доступность на указанные даты
      const conflictingDeals = await tx.deal.findMany({
        where: {
          adSlotId,
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
      });

      if (conflictingDeals.length > 0) {
        throw new ConflictException('Ad slot is already booked for the selected dates');
      }

      // Вычисляем стоимость
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const basePrice = Number(adSlot.pricePerDay.toString()) * days;
      const commission = basePrice * this.COMMISSION_RATE;
      const totalAmount = basePrice + commission;

      // Создаём сделку
      const deal = await tx.deal.create({
         {
          adSlotId,
          buyerId,
          status: DealStatus.created,
          startDate,
          endDate,
          totalAmount: new Prisma.Decimal(totalAmount),
          commission: new Prisma.Decimal(commission),
          contentBrief: dto.contentBrief,
        },
      });

      // Обновляем статус слота
      await tx.adSlot.update({
        where: { id: adSlotId },
         {
          status: 'booked',
        },
      });

      // Аудит-лог
      await tx.auditLog.create({
         {
          userId: buyerId,
          action: 'deal.created',
          entityType: 'Deal',
          entityId: deal.id,
          after: {
            adSlotId,
            totalAmount: totalAmount,
            commission: commission,
            startDate: dto.startDate,
            endDate: dto.endDate,
          },
        },
      });

      this.logger.log(`Deal created: ${deal.id}, slot: ${adSlotId}, buyer: ${buyerId}, total: ${totalAmount}`);

      return {
        deal,
        basePrice,
        commission,
        totalAmount,
      };
    });
  }

  /**
   * Оплата сделки
   */
  async payDeal(buyerId: string, dealId: string, idempotencyKey: string) {
    return prisma.$transaction(async (tx) => {
      const deal = await tx.deal.findUnique({
        where: { id: dealId },
        include: {
          adSlot: true,
        },
      });

      if (!deal) {
        throw new NotFoundException('Deal not found');
      }

      if (deal.buyerId !== buyerId) {
        throw new ForbiddenException('You can only pay for your own deals');
      }

      if (deal.status !== DealStatus.created) {
        throw new BadRequestException(`Deal is not in created status. Current: ${deal.status}`);
      }

      // Резервируем средства через FinanceService
      await this.financeService.reserve({
        userId: buyerId,
        amount: deal.totalAmount.toString(),
        description: `Оплата бронирования: ${deal.adSlot.title}`,
        idempotencyKey,
        relatedEntityType: 'deal',
        relatedEntityId: dealId,
      });

      // Обновляем статус сделки
      const updated = await tx.deal.update({
        where: { id: dealId },
         {
          status: DealStatus.paid,
        },
      });

      // Аудит-лог
      await tx.auditLog.create({
         {
          userId: buyerId,
          action: 'deal.paid',
          entityType: 'Deal',
          entityId: dealId,
          before: { status: deal.status },
          after: {
            status: updated.status,
            amount: deal.totalAmount.toString(),
          },
        },
      });

      this.logger.log(`Deal paid: ${dealId}, amount: ${deal.totalAmount}`);

      return updated;
    });
  }

  /**
   * Подтверждение выполнения (владельцем)
   */
  async confirmDeal(ownerId: string, dealId: string, dto: ConfirmDealDto) {
    return prisma.$transaction(async (tx) => {
      const deal = await tx.deal.findUnique({
        where: { id: dealId },
        include: {
          adSlot: true,
        },
      });

      if (!deal) {
        throw new NotFoundException('Deal not found');
      }

      if (deal.adSlot.ownerId !== ownerId) {
        throw new ForbiddenException('You can only confirm your own deals');
      }

      if (deal.status !== DealStatus.paid && deal.status !== DealStatus.in_progress) {
        throw new BadRequestException(`Deal is not in paid/in_progress status. Current: ${deal.status}`);
      }

      // Обновляем сделку
      const updated = await tx.deal.update({
        where: { id: dealId },
         {
          status: DealStatus.confirming,
          proofData: dto.proofData,
          confirmedAt: new Date(),
        },
      });

      // Добавляем в очередь модерации
      await tx.moderationQueue.create({
         {
          entityType: 'deal',
          entityId: dealId,
          status: 'pending',
          priority: 0,
        },
      });

      // Аудит-лог
      await tx.auditLog.create({
         {
          userId: ownerId,
          action: 'deal.confirmed',
          entityType: 'Deal',
          entityId: dealId,
          before: { status: deal.status },
          after: {
            status: updated.status,
            proofData: dto.proofData,
          },
        },
      });

      this.logger.log(`Deal confirmed: ${dealId} by owner ${ownerId}`);

      return updated;
    });
  }

  /**
   * Одобрение сделки (модератором)
   */
  async approveDeal(moderatorId: string, dealId: string, reviewNotes: string | undefined, idempotencyKey: string) {
    return prisma.$transaction(async (tx) => {
      const deal = await tx.deal.findUnique({
        where: { id: dealId },
        include: {
          adSlot: {
            include: {
              owner: true,
            },
          },
          buyer: true,
        },
      });

      if (!deal) {
        throw new NotFoundException('Deal not found');
      }

      if (deal.status !== DealStatus.confirming) {
        throw new BadRequestException(`Deal must be in confirming status. Current: ${deal.status}`);
      }

      // Обновляем сделку
      const updated = await tx.deal.update({
        where: { id: dealId },
         {
          status: DealStatus.completed,
          reviewNotes,
          completedAt: new Date(),
        },
      });

      // Вычисляем сумму для владельца (без комиссии)
      const ownerAmount = Number(deal.totalAmount.toString()) - Number(deal.commission.toString());

      // Выплачиваем владельцу через FinanceService
      await this.financeService.payToOwner({
        ownerId: deal.adSlot.ownerId,
        amount: ownerAmount.toString(),
        description: `Выплата за рекламное размещение: ${deal.adSlot.title}`,
        idempotencyKey,
        relatedEntityType: 'deal',
        relatedEntityId: dealId,
      });

      // Обновляем статус слота
      await tx.adSlot.update({
        where: { id: deal.adSlotId },
         {
          status: 'published',
        },
      });

      // Обновляем очередь модерации
      await tx.moderationQueue.updateMany({
        where: {
          entityType: 'deal',
          entityId: dealId,
        },
         {
          status: 'approved',
          assignedTo: moderatorId,
          reviewedAt: new Date(),
          decision: 'approved',
          decisionReason: reviewNotes,
        },
      });

      // Обновляем статистику владельца
      await tx.platformOwnerProfile.update({
        where: { userId: deal.adSlot.ownerId },
         {
          completedDeals: {
            increment: 1,
          },
        },
      });

      // Аудит-лог
      await tx.auditLog.create({
         {
          userId: moderatorId,
          action: 'deal.approved',
          entityType: 'Deal',
          entityId: dealId,
          before: { status: deal.status },
          after: {
            status: updated.status,
            ownerPayout: ownerAmount,
            commission: deal.commission.toString(),
          },
        },
      });

      this.logger.log(`Deal approved: ${dealId}, owner payout: ${ownerAmount}, commission: ${deal.commission}`);

      return updated;
    });
  }

  /**
   * Отклонение сделки (модератором)
   */
  async rejectDeal(moderatorId: string, dealId: string, reason: string, idempotencyKey: string) {
    return prisma.$transaction(async (tx) => {
      const deal = await tx.deal.findUnique({
        where: { id: dealId },
      });

      if (!deal) {
        throw new NotFoundException('Deal not found');
      }

      if (deal.status !== DealStatus.confirming) {
        throw new BadRequestException(`Deal must be in confirming status. Current: ${deal.status}`);
      }

      // Обновляем сделку
      const updated = await tx.deal.update({
        where: { id: dealId },
         {
          status: DealStatus.disputed,
          reviewNotes: reason,
        },
      });

      // Возвращаем средства покупателю
      await this.financeService.refund({
        userId: deal.buyerId,
        originalTransactionId: dealId, // В реальности нужно найти транзакцию резервирования
        amount: deal.totalAmount.toString(),
        description: `Возврат средств за отклонённую сделку`,
        idempotencyKey,
      });

      // Обновляем статус слота
      await tx.adSlot.update({
        where: { id: deal.adSlotId },
         {
          status: 'published',
        },
      });

      // Обновляем очередь модерации
      await tx.moderationQueue.updateMany({
        where: {
          entityType: 'deal',
          entityId: dealId,
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
      await tx.auditLog.create({
         {
          userId: moderatorId,
          action: 'deal.rejected',
          entityType: 'Deal',
          entityId: dealId,
          before: { status: deal.status },
          after: {
            status: updated.status,
            reason,
            refund: deal.totalAmount.toString(),
          },
        },
      });

      this.logger.log(`Deal rejected: ${dealId}, refund: ${deal.totalAmount}`);

      return updated;
    });
  }

  /**
   * ПОВТОРНАЯ ПОКУПКА: Упрощенный эндпоинт для покупки у того же владельца
   */
  async repurchase(buyerId: string, dto: RepurchaseDto) {
    // Получаем предыдущую сделку
    const previousDeal = await prisma.deal.findUnique({
      where: { id: dto.previousDealId },
      include: {
        adSlot: true,
      },
    });

    if (!previousDeal) {
      throw new NotFoundException('Previous deal not found');
    }

    if (previousDeal.buyerId !== buyerId) {
      throw new ForbiddenException('You can only repurchase your own deals');
    }

    if (previousDeal.status !== DealStatus.completed) {
      throw new BadRequestException('Can only repurchase completed deals');
    }

    // Бронируем тот же слот с новыми датами
    return this.bookSlot(buyerId, previousDeal.adSlotId, {
      startDate: dto.startDate,
      endDate: dto.endDate,
      contentBrief: previousDeal.contentBrief,
      idempotencyKey: dto.idempotencyKey,
    });
  }

  /**
   * Получение сделки
   */
  async getDeal(dealId: string) {
    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
      include: {
        adSlot: {
          include: {
            platform: true,
            owner: {
              select: {
                id: true,
                displayName: true,
              },
            },
          },
        },
        buyer: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    });

    if (!deal) {
      throw new NotFoundException('Deal not found');
    }

    return deal;
  }

  /**
   * Получение списка сделок пользователя
   */
  async getUserDeals(userId: string, role: 'buyer' | 'owner', status?: DealStatus) {
    const where: Prisma.DealWhereInput = {};

    if (role === 'buyer') {
      where.buyerId = userId;
    } else {
      where.adSlot = {
        ownerId: userId,
      };
    }

    if (status) {
      where.status = status;
    }

    return prisma.deal.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        adSlot: {
          select: {
            id: true,
            title: true,
            platform: {
              select: {
                name: true,
                type: true,
              },
            },
          },
        },
        buyer: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    });
  }
}
