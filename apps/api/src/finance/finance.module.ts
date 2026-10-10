import { Module } from '@nestjs/common';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';
import { MockPaymentProvider } from './providers/mock-payment.provider';

@Module({
  controllers: [FinanceController],
  providers: [
    FinanceService,
    {
      provide: 'PaymentProvider',
      useClass: MockPaymentProvider,
    },
  ],
  exports: [FinanceService],
})
export class FinanceModule {}
