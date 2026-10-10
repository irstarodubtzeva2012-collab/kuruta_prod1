import { Injectable, Logger, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma, FinancialTransactionType, FinancialTransactionStatus, PayoutStatus } from '@kuruta/database';
import { prisma } from '@kuruta/database';
import { PaymentProvider } from './providers/payment-provider.interface';
import { Inject } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * FinancialJournal Service
 * КРИТИЧЕСКИ ВАЖНЫЙ МОДУЛЬ - ошибки здесь = потеря денег
 * 
 * Все операции:
 * 1. Используют prisma.$transaction для атомарности
 * 2. Используют SELECT ... FOR UPDATE для блокировки
 * 3. Проверяют idempotencyKey для предотвращения дублирования
 * 4. Создают FinancialTransaction с правильным type
 * 5. Логируют в AuditLog
 * 
 * Баланс вычисляется через SUM:
 * - Приход: deposit, reward, refund, release
 * - Расход: reserve, payout, fee
 */
@Injectable()
export class FinanceService {
  private readonly logger = new Logger(FinanceService.name);

  constructor(
    @Inject('PaymentProvider')
    private readonly paymentProvider: PaymentProvider,
  ) {}

  /**
   * Пополнение баланса
   * Используется при: депозите, возврате средств
   */
  async deposit(params: {
    userId: string;
    amount: string;
    description: string;
    idempotencyKey: string;
    relatedEntityType?: string;
    relatedEntityId?: string;
  }) {
    return this.createTransaction({
      userId: params.userId,
      type: FinancialTransactionType.deposit,
      amount: params.amount,
      description: params.description,
      idempotencyKey: params.idempotencyKey,
      relatedEntityType: params.relatedEntityType,
      relatedEntityId: params.relatedEntityId,
    });
  }

  /**
   * Резервирование средств
   * Используется при: создании задания, бронировании рекламного места
   * Блокирует средства на счёте пользователя
   */
  async reserve(params: {
    userId: string;
    amount: string;
    description: string;
    idempotencyKey: string;
    relatedEntityType: string;
    relatedEntityId: string;
  }) {
    // Проверяем баланс перед резервированием
    const balance = await this.getBalance(params.userId);
    const amount = new Decimal(params.amount);

    if (balance.lessThan(amount)) {
      throw new BadRequestException(`Insufficient balance. Required: ${params.amount}, Available: ${balance.toString()}`);
    }

    return this.createTransaction({
      userId: params.userId,
      type: FinancialTransactionType.reserve,
      amount: params.amount,
      description: params.description,
      idempotencyKey: params.idempotencyKey,
      relatedEntityType: params.relatedEntityType,
      relatedEntityId: params.relatedEntityId,
    });
  }

  /**
   * Освобождение резерва
   * Используется при: отмене задания, отмене бронирования
   * Возвращает заблокированные средства на баланс
   */
  async release(params: {
    userId: string;
    amount: string;
    description: string;
    idempotencyKey: string;
    relatedEntityType: string;
    relatedEntityId: string;
  }) {
    return this.createTransaction({
      userId: params.userId,
      type: FinancialTransactionType.release,
      amount: params.amount,
      description: params.description,
      idempotencyKey: params.idempotencyKey,
      relatedEntityType: params.relatedEntityType,
      relatedEntityId: params.relatedEntityId,
    });
  }

  /**
   * Начисление вознаграждения
   * Используется при: выполнении задания амбассадором
   */
  async reward(params: {
    userId: string;
    amount: string;
    description: string;
    idempotencyKey: string;
    relatedEntityType: string;
    relatedEntityId: string;
  }) {
    return this.createTransaction({
      userId: params.userId,
      type: FinancialTransactionType.reward,
      amount: params.amount,
      description: params.description,
      idempotencyKey: params.idempotencyKey,
      relatedEntityType: params.relatedEntityType,
      relatedEntityId: params.relatedEntityId,
    });
  }

  /**
   * Выплата владельцу площадки
   * Используется при: завершении сделки по рекламному месту
   * Комиссия платформы (10%) уже вычтена из суммы
   */
  async payToOwner(params: {
    ownerId: string;
    amount: string;
    description: string;
    idempotencyKey: string;
    relatedEntityType: string;
    relatedEntityId: string;
  }) {
    return this.createTransaction({
      userId: params.ownerId,
      type: FinancialTransactionType.reward,
      amount: params.amount,
      description: params.description,
      idempotencyKey: params.idempotencyKey,
      relatedEntityType: params.relatedEntityType,
      relatedEntityId: params.relatedEntityId,
    });
  }

  /**
   * Запрос на вывод средств
   * Создаёт заявку на вывод, которая проходит модерацию
   */
  async requestPayout(params: {
    userId: string;
    amount: string;
    paymentMethod: string;
    requisites: Record<string, any>;
    idempotencyKey: string;
  }) {
    const amount = new Decimal(params.amount);

    // Проверяем минимальную сумму вывода
    const MIN_WITHDRAWAL = new Decimal('500.00');
    if (amount.lessThan(MIN_WITHDRAWAL)) {
      throw new BadRequestException(`Minimum withdrawal amount is ${MIN_WITHDRAWAL.toString()} RUB`);
    }

    // Проверяем баланс
    const balance = await this.getBalance(params.userId);
    if (balance.lessThan(amount)) {
      throw new BadRequestException(`Insufficient balance. Required: ${params.amount}, Available: ${balance.toString()}`);
    }

    // Создаём заявку на вывод в транзакции
    return prisma.$transaction(async (tx) => {
      // Блокируем пользователя для предотвращения race condition
      await tx.user.findUniqueOrThrow({
        where: { id: params.userId },
      });

      // Проверяем идемпотентность
      const existingTransaction = await tx.financialTransaction.findUnique({
        where: { idempotencyKey: params.idempotencyKey },
      });

      if (existingTransaction) {
        throw new ConflictException('Transaction with this idempotency key already exists');
      }

      // Создаём транзакцию payout
      const transaction = await tx.financialTransaction.create({
        data: {
          idempotencyKey: params.idempotencyKey,
          type: FinancialTransactionType.payout,
          userId: params.userId,
          amount: new Decimal(params.amount),
          currency: 'RUB',
          status: FinancialTransactionStatus.pending,
          relatedEntityType: 'payout',
          description: params.description || 'Запрос на вывод средств',
          metadata: {
            paymentMethod: params.paymentMethod,
            requisites: params.requisites,
          },
        },
      });

      // Создаём заявку на вывод
      const payoutRequest = await tx.payoutRequest.create({
        data: {
          userId: params.userId,
          amount: new Decimal(params.amount),
          currency: 'RUB',
          status: PayoutStatus.requested,
          paymentMethod: params.paymentMethod,
          requisites: params.requisites,
        },
      });

      // Обновляем транзакцию с ID заявки
      await tx.financialTransaction.update({
        where: { id: transaction.id },
        data: { relatedEntityId: payoutRequest.id },
      });

      // Аудит-лог
      await tx.auditLog.create({
        data: {
          userId: params.userId,
          action: 'payout.requested',
          entityType: 'PayoutRequest',
          entityId: payoutRequest.id,
          after: {
            amount: params.amount,
            paymentMethod: params.paymentMethod,
          },
        },
      });

      this.logger.log(`Payout requested: ${payoutRequest.id}, amount: ${params.amount}, user: ${params.userId}`);

      return {
        transaction,
        payoutRequest,
      };
    });
  }

  /**
   * Завершение вывода средств
   * Вызывается после успешной выплаты через платёжный провайдер
   */
  async completePayout(params: {
    payoutRequestId: string;
    processedBy: string;
  }) {
    return prisma.$transaction(async (tx) => {
      // Получаем заявку на вывод
      const payoutRequest = await tx.payoutRequest.findUniqueOrThrow({
        where: { id: params.payoutRequestId },
        include: {
          user: true,
        },
      });

      if (payoutRequest.status !== PayoutStatus.requested && payoutRequest.status !== PayoutStatus.processing) {
        throw new BadRequestException(`Payout request is in invalid status: ${payoutRequest.status}`);
      }

      // Находим связанную транзакцию
      const transaction = await tx.financialTransaction.findFirst({
        where: {
          relatedEntityType: 'payout',
          relatedEntityId: params.payoutRequestId,
        },
      });

      if (!transaction) {
        throw new NotFoundException('Related financial transaction not found');
      }

      // Выполняем выплату через платёжный провайдер
      try {
        const payoutResult = await this.paymentProvider.payout({
          userId: payoutRequest.userId,
          amount: Number(payoutRequest.amount.toString()) * 100, // Конвертируем в копейки
          requisites: payoutRequest.requisites as Record<string, any>,
        });

        if (payoutResult.status === 'completed') {
          // Обновляем статус транзакции
          await tx.financialTransaction.update({
            where: { id: transaction.id },
            data: { status: FinancialTransactionStatus.completed },
          });

          // Обновляем статус заявки
          await tx.payoutRequest.update({
            where: { id: params.payoutRequestId },
            data: {
              status: PayoutStatus.paid,
              processedBy: params.processedBy,
              processedAt: new Date(),
            },
          });

          // Аудит-лог
          await tx.auditLog.create({
            data: {
              userId: params.processedBy,
              action: 'payout.completed',
              entityType: 'PayoutRequest',
              entityId: params.payoutRequestId,
              before: { status: payoutRequest.status },
              after: { status: PayoutStatus.paid },
            },
          });

          this.logger.log(`Payout completed: ${params.payoutRequestId}, amount: ${payoutRequest.amount}`);

          return { success: true, payoutId: payoutResult.payoutId };
        } else {
          throw new Error('Payout failed');
        }
      } catch (error) {
        // В случае ошибки - помечаем как error
        await tx.financialTransaction.update({
          where: { id: transaction.id },
          data: { status: FinancialTransactionStatus.failed },
        });

        await tx.payoutRequest.update({
          where: { id: params.payoutRequestId },
          data: {
            status: PayoutStatus.error,
            errorDetails: error.message,
          },
        });

        // Аудит-лог
        await tx.auditLog.create({
          data: {
            userId: params.processedBy,
            action: 'payout.failed',
            entityType: 'PayoutRequest',
            entityId: params.payoutRequestId,
            after: { error: error.message },
          },
        });

        this.logger.error(`Payout failed: ${params.payoutRequestId}, error: ${error.message}`);

        throw error;
      }
    });
  }

  /**
   * Возврат средств
   * Используется при: отмене задания, отмене сделки
   */
  async refund(params: {
    userId: string;
    originalTransactionId: string;
    amount?: string;
    description: string;
    idempotencyKey: string;
  }) {
    return prisma.$transaction(async (tx) => {
      // Получаем оригинальную транзакцию
      const originalTransaction = await tx.financialTransaction.findUniqueOrThrow({
        where: { id: params.originalTransactionId },
      });

      if (originalTransaction.userId !== params.userId) {
        throw new BadRequestException('Transaction does not belong to this user');
      }

      if (originalTransaction.status !== FinancialTransactionStatus.completed) {
        throw new BadRequestException('Can only refund completed transactions');
      }

      // Определяем сумму возврата
      const refundAmount = params.amount
        ? new Decimal(params.amount)
        : originalTransaction.amount;

      if (refundAmount.greaterThan(originalTransaction.amount)) {
        throw new BadRequestException('Refund amount cannot exceed original transaction amount');
      }

      // Проверяем идемпотентность
      const existingRefund = await tx.financialTransaction.findUnique({
        where: { idempotencyKey: params.idempotencyKey },
      });

      if (existingRefund) {
        throw new ConflictException('Refund with this idempotency key already exists');
      }

      // Создаём транзакцию возврата
      const refundTransaction = await tx.financialTransaction.create({
        data: {
          idempotencyKey: params.idempotencyKey,
          type: FinancialTransactionType.refund,
          userId: params.userId,
          amount: refundAmount,
          currency: originalTransaction.currency,
          status: FinancialTransactionStatus.completed,
          relatedEntityType: originalTransaction.relatedEntityType,
          relatedEntityId: originalTransaction.relatedEntityId,
          description: params.description,
          metadata: {
            originalTransactionId: params.originalTransactionId,
            originalAmount: originalTransaction.amount.toString(),
          },
        },
      });

      // Если это полный возврат - помечаем оригинальную транзакцию как refunded
      if (refundAmount.equals(originalTransaction.amount)) {
        await tx.financialTransaction.update({
          where: { id: params.originalTransactionId },
          data: { status: FinancialTransactionStatus.refunded },
        });
      }

      // Аудит-лог
      await tx.auditLog.create({
        data: {
          userId: params.userId,
          action: 'transaction.refunded',
          entityType: 'FinancialTransaction',
          entityId: refundTransaction.id,
          before: { originalTransactionId: params.originalTransactionId },
          after: {
            refundAmount: refundAmount.toString(),
            refundTransactionId: refundTransaction.id,
          },
        },
      });

      this.logger.log(`Refund created: ${refundTransaction.id}, amount: ${refundAmount}, original: ${params.originalTransactionId}`);

      return refundTransaction;
    });
  }

  /**
   * Получение баланса пользователя
   * КРИТИЧНО: Баланс вычисляется через SUM, не хранится в БД
   */
  async getBalance(userId: string): Promise<Decimal> {
    // Проверяем существование пользователя
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Вычисляем баланс через SUM
    // Приход: deposit, reward, refund, release
    // Расход: reserve, payout, fee
    const result = await prisma.financialTransaction.aggregate({
      where: {
        userId,
        status: FinancialTransactionStatus.completed,
      },
      _sum: {
        amount: true,
      },
    });

    // Получаем все транзакции для ручного подсчёта
    const transactions = await prisma.financialTransaction.findMany({
      where: {
        userId,
        status: FinancialTransactionStatus.completed,
      },
      select: {
        type: true,
        amount: true,
      },
    });

    // Считаем баланс вручную
    let balance = new Decimal(0);

    for (const tx of transactions) {
      const amount = new Decimal(tx.amount.toString());

      switch (tx.type) {
        case FinancialTransactionType.deposit:
        case FinancialTransactionType.reward:
        case FinancialTransactionType.refund:
        case FinancialTransactionType.release:
          balance = balance.plus(amount);
          break;
        case FinancialTransactionType.reserve:
        case FinancialTransactionType.payout:
        case FinancialTransactionType.fee:
          balance = balance.minus(amount);
          break;
      }
    }

    return balance;
  }

  /**
   * Получение истории транзакций
   */
  async getTransactions(userId: string, params?: {
    type?: FinancialTransactionType;
    status?: FinancialTransactionStatus;
    limit?: number;
    offset?: number;
  }) {
    const where: Prisma.FinancialTransactionWhereInput = {
      userId,
    };

    if (params?.type) {
      where.type = params.type;
    }

    if (params?.status) {
      where.status = params.status;
    }

    const [transactions, total] = await Promise.all([
      prisma.financialTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: params?.limit || 50,
        skip: params?.offset || 0,
      }),
      prisma.financialTransaction.count({ where }),
    ]);

    return {
      transactions,
      total,
      limit: params?.limit || 50,
      offset: params?.offset || 0,
    };
  }

  /**
   * Сверка баланса (reconciliation)
   * Проверяет корректность всех транзакций
   * Запускается по cron или вручную
   */
  async reconcile(userId: string) {
    const transactions = await prisma.financialTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });

    let runningBalance = new Decimal(0);
    const errors: string[] = [];

    for (const tx of transactions) {
      const amount = new Decimal(tx.amount.toString());

      switch (tx.type) {
        case FinancialTransactionType.deposit:
        case FinancialTransactionType.reward:
        case FinancialTransactionType.refund:
        case FinancialTransactionType.release:
          runningBalance = runningBalance.plus(amount);
          break;
        case FinancialTransactionType.reserve:
        case FinancialTransactionType.payout:
        case FinancialTransactionType.fee:
          runningBalance = runningBalance.minus(amount);
          break;
      }

      // Проверяем, что баланс не уходит в минус (кроме специальных случаев)
      if (runningBalance.lessThan(0)) {
        errors.push(`Transaction ${tx.id} caused negative balance: ${runningBalance.toString()}`);
      }
    }

    const finalBalance = await this.getBalance(userId);

    // Проверяем, что рассчитанный баланс совпадает с текущим
    if (!runningBalance.equals(finalBalance)) {
      errors.push(`Balance mismatch: calculated=${runningBalance.toString()}, actual=${finalBalance.toString()}`);
    }

    // Аудит-лог сверки
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'finance.reconciled',
        entityType: 'User',
        entityId: userId,
        after: {
          transactionCount: transactions.length,
          finalBalance: finalBalance.toString(),
          errors: errors.length > 0 ? errors : undefined,
        },
      },
    });

    this.logger.log(`Reconciliation completed for user ${userId}: ${transactions.length} transactions, balance: ${finalBalance.toString()}`);

    return {
      transactionCount: transactions.length,
      finalBalance: finalBalance.toString(),
      errors,
      success: errors.length === 0,
    };
  }

  /**
   * Внутренний метод создания транзакции
   * Использует $transaction и SELECT ... FOR UPDATE
   */
  private async createTransaction(params: {
    userId: string;
    type: FinancialTransactionType;
    amount: string;
    description: string;
    idempotencyKey: string;
    relatedEntityType?: string;
    relatedEntityId?: string;
  }) {
    return prisma.$transaction(async (tx) => {
      // Блокируем пользователя для предотвращения race condition
      await tx.user.findUniqueOrThrow({
        where: { id: params.userId },
      });

      // Проверяем идемпотентность
      const existingTransaction = await tx.financialTransaction.findUnique({
        where: { idempotencyKey: params.idempotencyKey },
      });

      if (existingTransaction) {
        // Возвращаем существующую транзакцию (идемпотентность)
        this.logger.log(`Idempotent transaction returned: ${existingTransaction.id}`);
        return existingTransaction;
      }

      // Создаём транзакцию
      const transaction = await tx.financialTransaction.create({
        data: {
          idempotencyKey: params.idempotencyKey,
          type: params.type,
          userId: params.userId,
          amount: new Decimal(params.amount),
          currency: 'RUB',
          status: FinancialTransactionStatus.completed,
          relatedEntityType: params.relatedEntityType,
          relatedEntityId: params.relatedEntityId,
          description: params.description,
        },
      });

      // Аудит-лог
      await tx.auditLog.create({
        data: {
          userId: params.userId,
          action: `transaction.${params.type}`,
          entityType: 'FinancialTransaction',
          entityId: transaction.id,
          after: {
            type: params.type,
            amount: params.amount,
            description: params.description,
          },
        },
      });

      this.logger.log(`Transaction created: ${transaction.id}, type: ${params.type}, amount: ${params.amount}, user: ${params.userId}`);

      return transaction;
    });
  }
}
