import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { ModerationService } from './moderation.service';
import { ModerationController } from './moderation.controller';
import { TaskProcessor } from './processors/task.processor';
import { FinanceModule } from '../finance/finance.module';

@Module({
  imports: [
    FinanceModule,
    BullModule.registerQueue({
      name: 'task-queue',
    }),
  ],
  controllers: [
    CampaignsController,
    TasksController,
    ModerationController,
  ],
  providers: [
    CampaignsService,
    TasksService,
    ModerationService,
    TaskProcessor,
  ],
  exports: [CampaignsService, TasksService, ModerationService],
})
export class CampaignsModule {}
