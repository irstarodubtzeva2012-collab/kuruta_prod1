import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { prisma } from '@kuruta/database';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { GetAntiFraudSignalsDto, ReviewAntiFraudSignalDto, AntiFraudStatus } from './dto/anti-fraud.dto';

@Injectable()
export class AntiFraudService {
  private readonly logger = new Logger(AntiFraudService.name);

  constructor(
    @InjectQueue('anti-fraud-queue') private readonly antiFraudQueue: Queue,
  ) {}

  /**
   * Запуск проверки антифрод-сигналов (cron)
   */
  async scheduleAntiFraudChecks() {
    this.logger.log('Scheduling anti-fraud checks...');

    // Добавляем задачи в очередь
    await this.antiFraudQueue.add('check-duplicate-devices', {}, { repeat: { cron: '0 */6 * * *' } }); // Каждые 6 часов
    await this.antiFraudQueue.add('check-fast-completions', {}, { repeat: { cron: '0 */4 * * *' } }); // Каждые 4 часа
    await this.antiFraudQueue.add('check-duplicate-screenshots', {}, { repeat: { cron: '0 */8 * * *' } }); // Каждые 8 часов
    await this.antiFraudQueue.add('check-duplicate-requisites', {}, { repeat: { cron: '0 0 * * *' } }); // Раз в день

    this.logger.log('Anti-fraud checks scheduled');
  }

  /**
   * Проверка дубликатов device fingerprint
   */
  async checkDuplicateDevices() {
    this.logger.log('Checking for duplicate device fingerprints...');

    // Получаем все сессии с device fingerprint
    const sessions = await prisma.session.findMany({
      where: {
        userAgent: { not: null },
      },
      select: {
        userId: true,
        userAgent: true,
        ip: true,
      },
    });

    // Группируем по userAgent + ip
    const groups = new Map<string, Set<string>>();
    for (const session of sessions) {
      const key = `${session.userAgent}:${session.ip}`;
      if (!groups.has(key)) {
        groups.set(key, new Set());
      }
      groups.get(key)!.add(session.userId);
    }

    // Находим группы с несколькими пользователями
    for (const [key, userIds] of groups.entries()) {
      if (userIds.size > 1) {
        const [userAgent, ip] = key.split(':');
        
        // Создаём сигнал для каждого пользователя
        for (const userId of userIds) {
          await this.createSignal({
            type: 'duplicate_device_fingerprint',
            userId,
            severity: 'high',
            title: 'Duplicate device fingerprint detected',
            description: `User ${userId} shares device fingerprint with ${userIds.size - 1} other users`,
            meta {
              userAgent,
              ip,
              relatedUserIds: Array.from(userIds).filter(id => id !== userId),
            },
          });
        }
      }
    }

    this.logger.log(`Duplicate device check completed. Found ${groups.size} groups`);
  }

  /**
   * Проверка подозрительно быстрых выполнений
   */
  async checkFastCompletions() {
    this.logger.log('Checking for suspicious fast task completions...');

    // Получаем все завершённые задачи
    const tasks = await prisma.task.findMany({
      where: {
        status: 'paid',
        takenAt: { not: null },
        submittedAt: { not: null },
      },
      select: {
        id: true,
        ambassadorId: true,
        takenAt: true,
        submittedAt: true,
      },
    });

    // Проверяем время выполнения
    for (const task of tasks) {
      if (task.takenAt && task.submittedAt) {
        const duration = task.submittedAt.getTime() - task.takenAt.getTime();
        const durationMinutes = duration / (1000 * 60);

        // Если выполнение заняло меньше 5 минут - подозрительно
        if (durationMinutes < 5) {
          await this.createSignal({
            type: 'suspicious_fast_completion',
            userId: task.ambassadorId,
            severity: 'medium',
            title: 'Suspicious fast task completion',
            description: `Task ${task.id} was completed in ${durationMinutes.toFixed(2)} minutes`,
            meta {
              taskId: task.id,
              durationMinutes,
            },
          });
        }
      }
    }

    this.logger.log(`Fast completion check completed. Checked ${tasks.length} tasks`);
  }

  /**
   * Проверка дубликатов скриншотов (перцептивный хэш)
   */
  async checkDuplicateScreenshots() {
    this.logger.log('Checking for duplicate screenshots...');

    // Получаем все proofData с screenshots
    const tasks = await prisma.task.findMany({
      where: {
        proofData: { not: null },
      },
      select: {
        id: true,
        ambassadorId: true,
        proofData: true,
      },
    });

    // Извлекаем URLs скриншотов
    const screenshotUrls = new Map<string, string[]>();
    for (const task of tasks) {
      if (task.proofData && typeof task.proofData === 'object') {
        const proofData = task.proofData as any;
        if (proofData.screenshots && Array.isArray(proofData.screenshots)) {
          for (const url of proofData.screenshots) {
            if (!screenshotUrls.has(url)) {
              screenshotUrls.set(url, []);
            }
            screenshotUrls.get(url)!.push(task.ambassadorId);
          }
        }
      }
    }

    // Находим дубликаты
    for (const [url, ambassadorIds] of screenshotUrls.entries()) {
      if (ambassadorIds.length > 1) {
        // Создаём сигнал для каждого амбассадора
        for (const ambassadorId of ambassadorIds) {
          await this.createSignal({
            type: 'duplicate_proof_screenshots',
            userId: ambassadorId,
            severity: 'high',
            title: 'Duplicate proof screenshot detected',
            description: `Ambassador ${ambassadorId} used the same screenshot as ${ambassadorIds.length - 1} other ambassadors`,
            meta {
              screenshotUrl: url,
              relatedAmbassadorIds: ambassadorIds.filter(id => id !== ambassadorId),
            },
          });
        }
      }
    }

    this.logger.log(`Duplicate screenshot check completed. Checked ${screenshotUrls.size} screenshots`);
  }

  /**
   * Проверка дубликатов реквизитов для выплат
   */
  async checkDuplicateRequisites() {
    this.logger.log('Checking for duplicate payout requisites...');

    // Получаем все payout requests
    const payouts = await prisma.payoutRequest.findMany({
      where: {
        requisites: { not: null },
      },
      select: {
        id: true,
        userId: true,
        requisites: true,
      },
    });

    // Группируем по реквизитам
    const requisitesGroups = new Map<string, string[]>();
    for (const payout of payouts) {
      if (payout.requisites && typeof payout.requisites === 'object') {
        const key = JSON.stringify(payout.requisites);
        if (!requisitesGroups.has(key)) {
          requisitesGroups.set(key, []);
        }
        requisitesGroups.get(key)!.push(payout.userId);
      }
    }

    // Находим группы с несколькими пользователями
    for (const [requisitesKey, userIds] of requisitesGroups.entries()) {
      if (userIds.length > 1) {
        // Создаём сигнал для каждого пользователя
        for (const userId of userIds) {
          await this.createSignal({
            type: 'duplicate_payout_requisites',
            userId,
            severity: 'critical',
            title: 'Duplicate payout requisites detected',
            description: `User ${userId} shares payout requisites with ${userIds.length - 1} other users`,
            meta {
              requisites: JSON.parse(requisitesKey),
              relatedUserIds: userIds.filter(id => id !== userId),
            },
          });
        }
      }
    }

    this.logger.log(`Duplicate requisites check completed. Checked ${requisitesGroups.size} groups`);
  }

  /**
   * Создание антифрод-сигнала
   */
  async createSignal(data: {
    type: string;
    userId?: string;
    severity: string;
    title: string;
    description: string;
    meta any;
  }) {
    // Проверяем, нет ли уже такого сигнала
    const existing = await prisma.antiFraudSignal.findFirst({
      where: {
        type: data.type,
        userId: data.userId,
        meta {
          equals: data.meta,
        },
      },
    });

    if (existing) {
      this.logger.log(`Signal already exists: ${existing.id}`);
      return existing;
    }

    const signal = await prisma.antiFraudSignal.create({
       {
        type: data.type,
        userId: data.userId,
        severity: data.severity,
        title: data.title,
        description: data.description,
        meta data.meta,
        resolved: false,
      },
    });

    // Добавляем в очередь модерации
    await prisma.moderationQueue.create({
       {
        entityType: 'anti_fraud',
        entityId: signal.id,
        status: 'pending',
        priority: data.severity === 'critical' ? 20 : data.severity === 'high' ? 15 : 10,
      },
    });

    // Аудит-лог
    await prisma.auditLog.create({
       {
        action: 'anti_fraud.signal_created',
        entityType: 'AntiFraudSignal',
        entityId: signal.id,
        after: {
          type: data.type,
          userId: data.userId,
          severity: data.severity,
        },
      },
    });

    this.logger.log(`Anti-fraud signal created: ${signal.id}, type: ${data.type}`);

    return signal;
  }

  /**
   * Получение списка сигналов
   */
  async getSignals(filters: GetAntiFraudSignalsDto) {
    const where: Prisma.AntiFraudSignalWhereInput = {};

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.severity) {
      where.severity = filters.severity;
    }

    if (filters.status) {
      where.resolved = filters.status === 'dismissed' || filters.status === 'confirmed';
    }

    const [items, total] = await Promise.all([
      prisma.antiFraudSignal.findMany({
        where,
        orderBy: [
          { severity: 'desc' },
          { createdAt: 'desc' },
        ],
        take: filters.limit || 20,
        skip: filters.offset || 0,
      }),
      prisma.antiFraudSignal.count({ where }),
    ]);

    return {
      items,
      total,
      limit: filters.limit || 20,
      offset: filters.offset || 0,
    };
  }

  /**
   * Проверка сигнала модератором
   */
  async reviewSignal(moderatorId: string, signalId: string, dto: ReviewAntiFraudSignalDto) {
    const signal = await prisma.antiFraudSignal.findUnique({
      where: { id: signalId },
    });

    if (!signal) {
      throw new Error('Signal not found');
    }

    const updated = await prisma.antiFraudSignal.update({
      where: { id: signalId },
       {
        resolved: dto.status === 'confirmed' || dto.status === 'dismissed',
        resolution: dto.comment,
        reviewedBy: moderatorId,
        reviewedAt: new Date(),
      },
    });

    // Обновляем очередь модерации
    await prisma.moderationQueue.updateMany({
      where: {
        entityType: 'anti_fraud',
        entityId: signalId,
      },
       {
        status: dto.status === 'confirmed' ? 'approved' : 'rejected',
        assignedTo: moderatorId,
        reviewedAt: new Date(),
        decision: dto.status,
        decisionReason: dto.comment,
      },
    });

    // Аудит-лог
    await prisma.auditLog.create({
       {
        userId: moderatorId,
        action: 'anti_fraud.signal_reviewed',
        entityType: 'AntiFraudSignal',
        entityId: signalId,
        before: { resolved: signal.resolved },
        after: {
          status: dto.status,
          comment: dto.comment,
        },
      },
    });

    this.logger.log(`Anti-fraud signal ${signalId} reviewed by moderator ${moderatorId}, status: ${dto.status}`);

    return updated;
  }
}
