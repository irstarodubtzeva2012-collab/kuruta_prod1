import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { prisma } from '@kuruta/database';

@Processor('verification-queue')
export class VerificationProcessor {
  private readonly logger = new Logger(VerificationProcessor.name);

  /**
   * Повторная верификация амбассадоров (cron раз в 30 дней)
   */
  @Process('reverify-ambassadors')
  async handleReverifyAmbassadors(job: Job) {
    this.logger.log('Starting ambassador reverification...');

    try {
      // Получаем всех верифицированных амбассадоров
      const ambassadors = await prisma.ambassadorProfile.findMany({
        where: {
          isVerified: true,
        },
        include: {
          user: true,
        },
      });

      this.logger.log(`Found ${ambassadors.length} verified ambassadors to reverify`);

      for (const ambassador of ambassadors) {
        // Проверяем, нужна ли повторная верификация
        // В реальности здесь должна быть логика проверки активности, изменений и т.д.
        
        // Для примера: если амбассадор не выполнял задания последние 60 дней
        const lastTask = await prisma.task.findFirst({
          where: {
            ambassadorId: ambassador.userId,
            status: 'paid',
          },
          orderBy: {
            updatedAt: 'desc',
          },
        });

        if (!lastTask || lastTask.updatedAt < new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)) {
          // Создаём заявку на повторную верификацию
          await prisma.ambassadorVerificationRequest.create({
             {
              ambassadorId: ambassador.id,
              status: 'pending',
            },
          });

          // Добавляем в очередь модерации
          await prisma.moderationQueue.create({
             {
              entityType: 'ambassador_verification',
              entityId: ambassador.id,
              status: 'pending',
              priority: 5,
            },
          });

          // Аудит-лог
          await prisma.auditLog.create({
             {
              action: 'ambassador.reverification_required',
              entityType: 'AmbassadorProfile',
              entityId: ambassador.id,
              after: {
                userId: ambassador.userId,
                reason: 'Inactive for 60+ days',
              },
            },
          });

          this.logger.log(`Reverification required for ambassador ${ambassador.id}`);
        }
      }

      this.logger.log('Ambassador reverification completed');
    } catch (error) {
      this.logger.error('Error in ambassador reverification', error.stack);
      throw error;
    }
  }
}
