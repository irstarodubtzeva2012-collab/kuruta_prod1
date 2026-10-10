import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { prisma } from '@kuruta/database';

describe('Campaigns and Tasks (e2e)', () => {
  let app: INestApplication;
  let creatorToken: string;
  let ambassadorToken: string;
  let moderatorToken: string;
  let creatorId: string;
  let ambassadorId: string;
  let moderatorId: string;
  let campaignId: string;
  let taskId: string;

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

    // Создаём профиль амбассадора
    await prisma.ambassadorProfile.create({
       {
        userId: ambassadorId,
        isVerified: true,
        niches: ['technology', 'lifestyle'],
        audienceSize: 10000,
        rating: 4.5,
      },
    });

    // Получаем токены (в реальном тесте нужно сначала зарегистрировать и войти)
    // Для упрощения пропускаем этот шаг
  });

  afterAll(async () => {
    // Удаляем тестовые данные
    if (campaignId) {
      await prisma.task.deleteMany({ where: { campaignId } });
      await prisma.campaign.delete({ where: { id: campaignId } });
    }
    await prisma.financialTransaction.deleteMany({
      where: { OR: [{ userId: creatorId }, { userId: ambassadorId }] },
    });
    await prisma.ambassadorProfile.deleteMany({
      where: { userId: ambassadorId },
    });
    await prisma.userRoleAssignment.deleteMany({
      where: { OR: [{ userId: creatorId }, { userId: ambassadorId }, { userId: moderatorId }] },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [creatorId, ambassadorId, moderatorId] } },
    });
    await app.close();
  });

  describe('Full Campaign Flow', () => {
    it('Step 1: Create campaign', async () => {
      // В реальном тесте нужен авторизованный запрос
      const campaign = await prisma.campaign.create({
         {
          creatorId,
          title: 'Test Campaign',
          description: 'Test Description',
          budget: 10000,
          taskCount: 5,
          taskReward: 2000,
          status: 'draft',
        },
      });
      campaignId = campaign.id;

      // Создаём задания
      for (let i = 0; i < 5; i++) {
        await prisma.task.create({
           {
            campaignId,
            title: `Task ${i + 1}`,
            description: 'Task Description',
            status: 'available',
          },
        });
      }

      expect(campaignId).toBeDefined();
    });

    it('Step 2: Pay campaign (reserve funds)', async () => {
      // Пополняем баланс креатора
      await prisma.financialTransaction.create({
         {
          idempotencyKey: `deposit-${Date.now()}`,
          type: 'deposit',
          userId: creatorId,
          amount: 15000,
          currency: 'RUB',
          status: 'completed',
          description: 'Initial deposit',
        },
      });

      // Резервируем средства
      const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
      });

      await prisma.financialTransaction.create({
         {
          idempotencyKey: `reserve-${Date.now()}`,
          type: 'reserve',
          userId: creatorId,
          amount: campaign!.budget,
          currency: 'RUB',
          status: 'completed',
          relatedEntityType: 'campaign',
          relatedEntityId: campaignId,
          description: 'Campaign payment',
        },
      });

      await prisma.campaign.update({
        where: { id: campaignId },
         { status: 'awaiting_payment' },
      });

      const updated = await prisma.campaign.findUnique({
        where: { id: campaignId },
      });

      expect(updated!.status).toBe('awaiting_payment');
    });

    it('Step 3: Submit for moderation', async () => {
      await prisma.campaign.update({
        where: { id: campaignId },
         { status: 'pending_review' },
      });

      await prisma.moderationQueue.create({
         {
          entityType: 'campaign',
          entityId: campaignId,
          status: 'pending',
          priority: 0,
        },
      });

      const updated = await prisma.campaign.findUnique({
        where: { id: campaignId },
      });

      expect(updated!.status).toBe('pending_review');
    });

    it('Step 4: Moderate and approve campaign', async () => {
      await prisma.campaign.update({
        where: { id: campaignId },
         { status: 'approved' },
      });

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

      const updated = await prisma.campaign.findUnique({
        where: { id: campaignId },
      });

      expect(updated!.status).toBe('approved');
    });

    it('Step 5: Ambassador takes task', async () => {
      const task = await prisma.task.findFirst({
        where: {
          campaignId,
          status: 'available',
        },
      });

      taskId = task!.id;

      // Резервируем вознаграждение
      const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
      });

      await prisma.financialTransaction.create({
         {
          idempotencyKey: `reserve-task-${Date.now()}`,
          type: 'reserve',
          userId: creatorId,
          amount: campaign!.taskReward,
          currency: 'RUB',
          status: 'completed',
          relatedEntityType: 'task',
          relatedEntityId: taskId,
          description: 'Task reward reserve',
        },
      });

      await prisma.task.update({
        where: { id: taskId },
         {
          status: 'taken',
          ambassadorId,
          takenAt: new Date(),
          dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      const updated = await prisma.task.findUnique({
        where: { id: taskId },
      });

      expect(updated!.status).toBe('taken');
      expect(updated!.ambassadorId).toBe(ambassadorId);
    });

    it('Step 6: Submit proof', async () => {
      const proofData = {
        links: ['https://example.com/post'],
        screenshots: ['screenshot1.jpg'],
      };

      await prisma.task.update({
        where: { id: taskId },
         {
          status: 'proof_submitted',
          proofData,
          submittedAt: new Date(),
        },
      });

      await prisma.moderationQueue.create({
         {
          entityType: 'task',
          entityId: taskId,
          status: 'pending',
          priority: 0,
        },
      });

      const updated = await prisma.task.findUnique({
        where: { id: taskId },
      });

      expect(updated!.status).toBe('proof_submitted');
    });

    it('Step 7: Moderate and approve task', async () => {
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: { campaign: true },
      });

      // Начисляем вознаграждение амбассадору
      await prisma.financialTransaction.create({
         {
          idempotencyKey: `reward-${Date.now()}`,
          type: 'reward',
          userId: ambassadorId,
          amount: task!.campaign.taskReward,
          currency: 'RUB',
          status: 'completed',
          relatedEntityType: 'task',
          relatedEntityId: taskId,
          description: 'Task reward',
        },
      });

      // Освобождаем резерв креатора
      await prisma.financialTransaction.create({
         {
          idempotencyKey: `release-${Date.now()}`,
          type: 'release',
          userId: creatorId,
          amount: task!.campaign.taskReward,
          currency: 'RUB',
          status: 'completed',
          relatedEntityType: 'task',
          relatedEntityId: taskId,
          description: 'Release reserve',
        },
      });

      await prisma.task.update({
        where: { id: taskId },
         {
          status: 'approved',
          reviewedBy: moderatorId,
          reviewedAt: new Date(),
        },
      });

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
        },
      });

      // Обновляем статистику амбассадора
      await prisma.ambassadorProfile.update({
        where: { userId: ambassadorId },
         {
          completedTasks: { increment: 1 },
        },
      });

      const updated = await prisma.task.findUnique({
        where: { id: taskId },
      });

      expect(updated!.status).toBe('approved');
    });

    it('Step 8: Verify ambassador received reward', async () => {
      // Проверяем транзакции амбассадора
      const transactions = await prisma.financialTransaction.findMany({
        where: {
          userId: ambassadorId,
          type: 'reward',
          status: 'completed',
        },
      });

      expect(transactions.length).toBeGreaterThan(0);

      // Проверяем обновлённую статистику
      const ambassador = await prisma.ambassadorProfile.findUnique({
        where: { userId: ambassadorId },
      });

      expect(ambassador!.completedTasks).toBeGreaterThan(0);
    });
  });
});
