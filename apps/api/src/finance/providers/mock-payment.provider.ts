import { Injectable, Logger } from '@nestjs/common';
import { PaymentProvider } from './payment-provider.interface';

/**
 * Mock платёжный провайдер для разработки и тестирования
 * Имитирует работу реальной платёжной системы
 */
@Injectable()
export class MockPaymentProvider implements PaymentProvider {
  private readonly logger = new Logger(MockPaymentProvider.name);
  
  // Хранилище для имитации состояния платежей
  private payments = new Map<string, { status: 'pending' | 'completed' | 'failed' | 'refunded'; amount: number }>();
  private payouts = new Map<string, { status: 'pending' | 'completed' | 'failed'; amount: number }>();
  private counter = 0;

  async createPayment(params: {
    amount: number;
    currency: string;
    description: string;
    metadata?: Record<string, any>;
  }): Promise<{ paymentId: string; status: 'pending' | 'completed' | 'failed' }> {
    this.counter++;
    const paymentId = `mock_payment_${this.counter}_${Date.now()}`;
    
    this.logger.log(`[MOCK] Creating payment: ${paymentId}, amount: ${params.amount} ${params.currency}`);
    
    // Имитируем успешное создание платежа
    this.payments.set(paymentId, { status: 'completed', amount: params.amount });
    
    return { paymentId, status: 'completed' };
  }

  async getPaymentStatus(paymentId: string): Promise<{ status: 'pending' | 'completed' | 'failed' | 'refunded' }> {
    const payment = this.payments.get(paymentId);
    
    if (!payment) {
      throw new Error(`Payment ${paymentId} not found`);
    }
    
    return { status: payment.status };
  }

  async refundPayment(paymentId: string, amount?: number): Promise<{ refundId: string; status: 'pending' | 'completed' | 'failed' }> {
    const payment = this.payments.get(paymentId);
    
    if (!payment) {
      throw new Error(`Payment ${paymentId} not found`);
    }
    
    this.counter++;
    const refundId = `mock_refund_${this.counter}_${Date.now()}`;
    
    this.logger.log(`[MOCK] Refunding payment: ${paymentId}, refund: ${refundId}, amount: ${amount || 'full'}`);
    
    // Обновляем статус платежа
    payment.status = 'refunded';
    
    return { refundId, status: 'completed' };
  }

  async payout(params: {
    userId: string;
    amount: number;
    requisites: Record<string, any>;
  }): Promise<{ payoutId: string; status: 'pending' | 'completed' | 'failed' }> {
    this.counter++;
    const payoutId = `mock_payout_${this.counter}_${Date.now()}`;
    
    this.logger.log(`[MOCK] Creating payout: ${payoutId}, userId: ${params.userId}, amount: ${params.amount}`);
    
    // Имитируем успешную выплату
    this.payouts.set(payoutId, { status: 'completed', amount: params.amount });
    
    return { payoutId, status: 'completed' };
  }
}
