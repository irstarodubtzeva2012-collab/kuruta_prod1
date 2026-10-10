import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ModerationController } from './moderation.controller';
import { ModerationService } from './moderation.service';
import { DisputesController } from './disputes.controller';
import { DisputesService } from './disputes.service';
import { AntiFraudController } from './anti-fraud.controller';
import { AntiFraudService } from './anti-fraud.service';
import { AntiFraudProcessor } from './processors/anti-fraud.processor';
import { VerificationProcessor } from './processors/verification.processor';
import { FinanceModule } from '../finance/finance.module';
import { AdSlotsModule } from '../ad-slots/ad-slots.module';
import { CampaignsModule } from '../campaigns/campaigns.module';

@Module({
  imports: [
    FinanceModule,
    AdSlotsModule,
    CampaignsModule,
    BullModule.registerQueue({
      name: 'anti-fraud-queue',
    }),
    BullModule.registerQueue({
      name: 'verification-queue',
    }),
  ],
  controllers: [
    ModerationController,
    DisputesController,
    AntiFraudController,
  ],
  providers: [
    ModerationService,
    DisputesService,
    AntiFraudService,
    AntiFraudProcessor,
    VerificationProcessor,
  ],
  exports: [ModerationService, DisputesService, AntiFraudService],
})
export class ModerationModule {}
