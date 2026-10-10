import { Module } from '@nestjs/common';
import { AdSlotsController } from './ad-slots.controller';
import { AdSlotsService } from './ad-slots.service';
import { DealsController } from './deals.controller';
import { DealsService } from './deals.service';
import { FinanceModule } from '../finance/finance.module';

@Module({
  imports: [FinanceModule],
  controllers: [AdSlotsController, DealsController],
  providers: [AdSlotsService, DealsService],
  exports: [AdSlotsService, DealsService],
})
export class AdSlotsModule {}
