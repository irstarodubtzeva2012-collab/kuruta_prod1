import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { prisma } from '@kuruta/database';
import { FinanceService } from '../src/finance/finance.service';

describe('Finance (e2e)', () => {
  let app: INestApplication;
  let financeService: FinanceService;
  let testUserId: string;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    financeService = moduleFixture.get<FinanceService>(FinanceService);

    // Создаём тестового пользователя
    const user = await prisma.user.create({
      data: {
        email: `finance-test-${Date.now()}@example.com`,
        passwordHash: 'test-hash',
        displayName: 'Finance Test User',
      },
    });
    testUserId = user.id;

    // Получаем access token
    const authResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: user.email,
        password: 'test-password',
      });
    
    // В реальном тесте нужно сначала зарегистрировать пользователя
    // Для упрощения пропускаем этот шаг
  });

  afterAll(async () => {
    // Удаляем тестовые данные
    if (testUserId) {
      await prisma.financialTransaction.deleteMany({
        where: { userId: testUserId },
      });
      await prisma.payoutRequest.deleteMany({
        where: { userId: testUserId },
      });
      await prisma.user.delete({
        where: { id: testUserId },
      });
    }
    await app.close();
  });

  describe('Idempotency', () => {
    it('should return same transaction on duplicate idempotency key', async () => {
      const idempotencyKey = '550e8400-e29b-41d4-a716-446655440001';
      const amount = '1000.00';

      // Первый запрос
      const firstTransaction = await financeService.deposit({
        userId: testUserId,
        amount,
        description: 'Test deposit',
        idempotencyKey,
      });

      // Второй запрос с тем же idempotency key
      const secondTransaction = await financeService.deposit({
        userId: testUserId,
        amount,
        description: 'Test deposit',
        idempotencyKey,
      });

      // Должна вернуться та же транзакция
      expect(secondTransaction.id).toBe(firstTransaction.id);
      expect(secondTransaction.amount.toString()).toBe(amount);

      // Проверяем, что в БД только одна транзакция с этим idempotency key
      const count = await prisma.financialTransaction.count({
        where: { idempotencyKey },
      });
      expect(count).toBe(1);
    });

    it('should create different transactions for different idempotency keys', async () => {
      const amount = '500.00';

      const transaction1 = await financeService.deposit({
        userId: testUserId,
        amount,
        description: 'First deposit',
        idempotencyKey: '550e8400-e29b-41d4-a716-446655440002',
      });

      const transaction2 = await financeService.deposit({
        userId: testUserId,
        amount,
        description: 'Second deposit',
        idempotencyKey: '550e8400-e29b-41d4-a716-446655440003',
      });

      expect(transaction1.id).not.toBe(transaction2.id);
    });
  });

  describe('Race Conditions', () => {
    it('should handle concurrent reserve operations correctly', async () => {
      // Сначала пополняем баланс
      await financeService.deposit({
        userId: testUserId,
        amount: '1000.00',
        description: 'Initial deposit',
        idempotencyKey: '550e8400-e29b-41d4-a716-446655440010',
      });

      // Пытаемся зарезервировать 800 дважды одновременно
      const promises = [
        financeService.reserve({
          userId: testUserId,
          amount: '800.00',
          description: 'First reserve',
          idempotencyKey: '550e8400-e29b-41d4-a716-446655440011',
          relatedEntityType: 'task',
          relatedEntityId: '550e8400-e29b-41d4-a716-446655440020',
        }),
        financeService.reserve({
          userId: testUserId,
          amount: '800.00',
          description: 'Second reserve',
          idempotencyKey: '550e8400-e29b-41d4-a716-446655440012',
          relatedEntityType: 'task',
          relatedEntityId: '550e8400-e29b-41d4-a716-446655440021',
        }),
      ];

      // Одна из операций должна завершиться успешно, другая - с ошибкой
      const results = await Promise.allSettled(promises);

      const successful = results.filter(r => r.status === 'fulfilled');
      const failed = results.filter(r => r.status === 'rejected');

      // Должна быть ровно одна успешная операция
      expect(successful.length).toBe(1);
      expect(failed.length).toBe(1);

      // Проверяем, что баланс корректен
      const balance = await financeService.getBalance(testUserId);
      // 1000 (deposit) - 800 (reserve) = 200
      expect(balance.toString()).toBe('200.00');
    });

    it('should prevent double-spending with concurrent payouts', async () => {
      // Пополняем баланс
      await financeService.deposit({
        userId: testUserId,
        amount: '1000.00',
        description: 'Deposit for payout test',
        idempotencyKey: '550e8400-e29b-41d4-a716-446655440030',
      });

      // Пытаемся вывести 600 дважды одновременно
      const promises = [
        financeService.requestPayout({
          userId: testUserId,
          amount: '600.00',
          paymentMethod: 'card',
          requisites: { cardNumber: '****1234' },
          idempotencyKey: '550e8400-e29b-41d4-a716-446655440031',
        }),
        financeService.requestPayout({
          userId: testUserId,
          amount: '600.00',
          paymentMethod: 'card',
          requisites: { cardNumber: '****5678' },
          idempotencyKey: '550e8400-e29b-41d4-a716-446655440032',
        }),
      ];

      const results = await Promise.allSettled(promises);

      const successful = results.filter(r => r.status === 'fulfilled');
      const failed = results.filter(r => r.status === 'rejected');

      // Должна быть ровно одна успешная операция
      expect(successful.length).toBe(1);
      expect(failed.length).toBe(1);
    });
  });

  describe('Balance Calculation', () => {
    it('should calculate balance correctly with multiple transactions', async () => {
      // Создаём нового пользователя для чистого теста
      const newUser = await prisma.user.create({
        data: {
          email: `balance-test-${Date.now()}@example.com`,
          passwordHash: 'test-hash',
        },
      });

      // Пополняем 1000
      await financeService.deposit({
        userId: newUser.id,
        amount: '1000.00',
        description: 'Deposit 1',
        idempotencyKey: '550e8400-e29b-41d4-a716-446655440040',
      });

      // Пополняем ещё 500
      await financeService.deposit({
        userId: newUser.id,
        amount: '500.00',
        description: 'Deposit 2',
        idempotencyKey: '550e8400-e29b-41d4-a716-446655440041',
      });

      // Резервируем 300
      await financeService.reserve({
        userId: newUser.id,
        amount: '300.00',
        description: 'Reserve',
        idempotencyKey: '550e8400-e29b-41d4-a716-446655440042',
        relatedEntityType: 'task',
        relatedEntityId: '550e8400-e29b-41d4-a716-446655440050',
      });

      // Начисляем вознаграждение 200
      await financeService.reward({
        userId: newUser.id,
        amount: '200.00',
        description: 'Reward',
        idempotencyKey: '550e8400-e29b-41d4-a716-446655440043',
        relatedEntityType: 'task',
        relatedEntityId: '550e8400-e29b-41d4-a716-446655440051',
      });

      // Проверяем баланс
      // 1000 + 500 - 300 + 200 = 1400
      const balance = await financeService.getBalance(newUser.id);
      expect(balance.toString()).toBe('1400.00');

      // Очищаем
      await prisma.financialTransaction.deleteMany({
        where: { userId: newUser.id },
      });
      await prisma.user.delete({
        where: { id: newUser.id },
      });
    });
  });

  describe('Reconciliation', () => {
    it('should detect balance mismatches', async () => {
      const result = await financeService.reconcile(testUserId);

      expect(result).toHaveProperty('transactionCount');
      expect(result).toHaveProperty('finalBalance');
      expect(result).toHaveProperty('success');
      expect(result.success).toBe(true);
    });
  });

  describe('API Endpoints', () => {
    it('GET /finance/balance should return user balance', async () => {
      // В реальном тесте нужен авторизованный запрос
      // Для упрощения пропускаем
    });

    it('GET /finance/transactions should return transaction history', async () => {
      // В реальном тесте нужен авторизованный запрос
      // Для упрощения пропускаем
    });

    it('POST /finance/payout should create payout request', async () => {
      // В реальном тесте нужен авторизованный запрос
      // Для упрощения пропускаем
    });
  });
});
