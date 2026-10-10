/**
 * Интерфейс платёжного провайдера
 * Абстракция для работы с платёжными системами (ЮKassa, Stripe, etc.)
 */
export interface PaymentProvider {
  /**
   * Создание платежа
   * @param amount - сумма в копейках/центах
   * @param currency - валюта (RUB, USD, etc.)
   * @param description - описание платежа
   * @param metadata - дополнительные данные
   * @returns ID платежа в платёжной системе
   */
  createPayment(params: {
    amount: number;
    currency: string;
    description: string;
    metadata?: Record<string, any>;
  }): Promise<{ paymentId: string; status: 'pending' | 'completed' | 'failed' }>;

  /**
   * Проверка статуса платежа
   * @param paymentId - ID платежа в платёжной системе
   */
  getPaymentStatus(paymentId: string): Promise<{ status: 'pending' | 'completed' | 'failed' | 'refunded' }>;

  /**
   * Возврат средств
   * @param paymentId - ID платежа в платёжной системе
   * @param amount - сумма возврата (если null, полный возврат)
   */
  refundPayment(paymentId: string, amount?: number): Promise<{ refundId: string; status: 'pending' | 'completed' | 'failed' }>;

  /**
   * Выплата средств пользователю
   * @param userId - ID пользователя
   * @param amount - сумма выплаты
   * @param requisites - реквизиты для выплаты
   */
  payout(params: {
    userId: string;
    amount: number;
    requisites: Record<string, any>;
  }): Promise<{ payoutId: string; status: 'pending' | 'completed' | 'failed' }>;
}
