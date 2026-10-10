import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { prisma } from '@kuruta/database';

describe('Disputes (e2e)', () => {
  let app: INestApplication;
  let creatorToken: string;
  let ambassadorToken: string;
  let moderatorToken: string;
  let creatorId: string;
  let ambassadorId: string;
  let moderatorId: string;
  let campaignId: string;
  let taskId: string;
  let disputeId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Создаём тестовых пользователей
    const creator = await prisma.user.create({
       {
        email: `creator-${Date.now()}@example.com`,
        passwordHash: 'test-hash',
        displayName: 'Test Creator',
      },
    });
    creatorId = creator.id;

    const ambassador = await prisma.user.create({
       {
        email: `ambassador-${Date.now()}@example.com`,
        passwordHash: 'test-hash',
        displayName: 'Test Ambassador',
      },
    });
    ambassadorId = ambassador.id;

    const moderator = await prisma.user.create({
       {
        email: `moderator-${Date.now()}@example.com`,
        passwordHash: 'test-hash',
        displayName: 'Test Moderator',
      },
    });
    moderatorId = moderator.id;

    // Назначаем роли
    await prisma.userRoleAssignment.createMany({
       [
        { userId: creatorId, role: 'creator' },
        { userId: ambassadorId, role: 'ambassador' },
        { userId: moderatorId, role: 'moderator' },
      ],
    });

    // Создаём кампанию
    const campaign = await prisma.campaign.create({
       {
        creatorId,
        title: 'Test Campaign',
        description: 'Test Description',
        budget: 10000,
        taskCount: 1,
        taskReward: 1000,
        status: 'approved',
      },
    });
    campaignId = campaign.id;

    // Создаём задание
    const task = await prisma.task.create({
       {
        campaignId,
        title: 'Test Task',
        description: 'Test Description',
        status: 'in_progress',
        ambassadorId,
        takenAt: new Date(),
      },
    });
    taskId = task.id;

    // Резервируем средства для задания
    await prisma.financialTransaction.create({
       {
        idempotencyKey: `reserve-${Date.now()}`,
        type: 'reserve',
        userId: creatorId,
        amount: 1000,
        currency: 'RUB',
        status: 'completed',
        relatedEntityType: 'task',
        relatedEntityId: taskId,
        description: 'Task reserve',
      },
    });
  });

  afterAll(async () => {
    // Удаляем тестовые данные
    if (disputeId) {
      await prisma.dispute.delete({ where: { id: disputeId } }).catch(() => {});
    }
    if (taskId) {
      await prisma.task.delete({ where: { id: taskId } }).catch(() => {});
    }
    if (campaignId) {
      await prisma.campaign.delete({ where: { id: campaignId } }).catch(() => {});
    }
    await prisma.financialTransaction.deleteMany({
      where: { OR: [{ userId: creatorId }, { userId: ambassadorId }] },
    }).catch(() => {});
    await prisma.userRoleAssignment.deleteMany({
      where: { OR: [{ userId: creatorId }, { userId: ambassadorId }, { userId: moderatorId }] },
    }).catch(() => {});
    await prisma.user.deleteMany({
      where: { id: { in: [creatorId, ambassadorId, moderatorId] } },
    }).catch(() => {});
    await app.close();
  });

  describe('Dispute Flow', () => {
    it('Step 1: Open dispute', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/disputes')
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
          entityType: 'task',
          entityId: taskId,
          reason: 'Task not completed properly',
          details: 'The work does not meet the requirements',
          evidence: { screenshots: ['screenshot1.jpg'] },
        })
        .expect(201);

      disputeId = response.body.id;
      expect(disputeId).toBeDefined();
      expect(response.body.status).toBe('opened');
      expect(response.body.relatedType).toBe('task');
      expect(response.body.relatedId).toBe(taskId);

      // Проверяем, что задача заблокирована
      const task = await prisma.task.findUnique({
        where: { id: taskId },
      });
      expect(task!.status).toBe('disputed');
    });

    it('Step 2: Get dispute', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/disputes/${disputeId}`)
        .set('Authorization', `Bearer ${creatorToken}`)
        .expect(200);

      expect(response.body.id).toBe(disputeId);
      expect(response.body.status).toBe('opened');
    });

    it('Step 3: Resolve dispute in favor of creator (full refund)', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/disputes/${disputeId}/resolve`)
        .set('Authorization', `Bearer ${moderatorToken}`)
        .send({
          resolution: 'in_favor_of_creator',
          comment: 'Task was not completed according to requirements',
          idempotencyKey: `resolve-${Date.now()}`,
        })
        .expect(200);

      expect(response.body.dispute.status).toBe('resolved_creator');
      expect(response.body.distribution.creatorRefund).toBe(1000);
      expect(response.body.distribution.executorPayout).toBe(0);

      // Проверяем, что средства возвращены креатору
      const transactions = await prisma.financialTransaction.findMany({
        where: {
          userId: creatorId,
          type: 'refund',
          status: 'completed',
        },
      });

      expect(transactions.length).toBeGreaterThan(0);
      const refundTx = transactions.find(t => t.relatedEntityId === taskId);
      expect(refundTx).toBeDefined();
      expect(Number(refundTx!.amount)).toBe(1000);

      // Проверяем, что задача отменена
      const task = await prisma.task.findUnique({
        where: { id: taskId },
      });
      expect(task!.status).toBe('cancelled');
    });
  });

  describe('Dispute Resolution Variants', () => {
    let disputeId2: string;
    let taskId2: string;

    beforeAll(async () => {
      // Создаём второе задание для теста частичного возврата
      const task2 = await prisma.task.create({
         {
          campaignId,
          title: 'Test Task 2',
          description: 'Test Description 2',
          status: 'in_progress',
          ambassadorId,
          takenAt: new Date(),
        },
      });
      taskId2 = task2.id;

      // Резервируем средства
      await prisma.financialTransaction.create({
         {
          idempotencyKey: `reserve2-${Date.now()}`,
          type: 'reserve',
          userId: creatorId,
          amount: 1000,
          currency: 'RUB',
          status: 'completed',
          relatedEntityType: 'task',
          relatedEntityId: taskId2,
          description: 'Task reserve 2',
        },
      });
    });

    afterAll(async () => {
      if (disputeId2) {
        await prisma.dispute.delete({ where: { id: disputeId2 } }).catch(() => {});
      }
      if (taskId2) {
        await prisma.task.delete({ where: { id: taskId2 } }).catch(() => {});
      }
    });

    it('Should resolve dispute with partial refund', async () => {
      // Открываем спор
      const openResponse = await request(app.getHttpServer())
        .post('/api/v1/disputes')
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
          entityType: 'task',
          entityId: taskId2,
          reason: 'Partial completion',
        })
        .expect(201);

      disputeId2 = openResponse.body.id;

      // Разрешаем с частичным возвратом 50%
      const resolveResponse = await request(app.getHttpServer())
        .post(`/api/v1/disputes/${disputeId2}/resolve`)
        .set('Authorization', `Bearer ${moderatorToken}`)
        .send({
          resolution: 'partial_refund',
          refundPercentage: 50,
          comment: 'Task partially completed',
          idempotencyKey: `resolve2-${Date.now()}`,
        })
        .expect(200);

      expect(resolveResponse.body.dispute.status).toBe('resolved_partial');
      expect(resolveResponse.body.distribution.creatorRefund).toBe(500);
      expect(resolveResponse.body.distribution.executorPayout).toBe(500);

      // Проверяем транзакции
      const refundTx = await prisma.financialTransaction.findFirst({
        where: {
          userId: creatorId,
          type: 'refund',
          relatedEntityId: taskId2,
        },
      });
      expect(refundTx).toBeDefined();
      expect(Number(refundTx!.amount)).toBe(500);

      const rewardTx = await prisma.financialTransaction.findFirst({
        where: {
          userId: ambassadorId,
          type: 'reward',
          relatedEntityId: taskId2,
        },
      });
      expect(rewardTx).toBeDefined();
      expect(Number(rewardTx!.amount)).toBe(500);
    });
  });

  describe('Dispute Access Control', () => {
    it('Should not allow non-party to open dispute', async () => {
      // Создаём третьего пользователя
      const thirdUser = await prisma.user.create({
         {
          email: `third-${Date.now()}@example.com`,
          passwordHash: 'test-hash',
        },
      });

      await request(app.getHttpServer())
        .post('/api/v1/disputes')
        .set('Authorization', `Bearer third-user-token`)
        .send({
          entityType: 'task',
          entityId: taskId,
          reason: 'Test',
        })
        .expect(403);

      await prisma.user.delete({ where: { id: thirdUser.id } });
    });

    it('Should not allow non-moderator to resolve dispute', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/disputes/${disputeId}/resolve`)
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
          resolution: 'in_favor_of_creator',
          comment: 'Test',
          idempotencyKey: `test-${Date.now()}`,
        })
        .expect(403);
    });
  });
});
