import { IsDecimal, IsString, IsUUID, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class DepositDto {
  @ApiProperty({ description: 'Сумма пополнения', example: '1000.00' })
  @IsDecimal({ decimal_digits: '2' })
  @Type(() => String)
  amount: string;

  @ApiProperty({ description: 'Описание операции', example: 'Пополнение баланса' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Idempotency key для предотвращения дублирования', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  idempotencyKey: string;

  @ApiProperty({ description: 'ID связанной сущности (опционально)', required: false })
  @IsOptional()
  @IsUUID()
  relatedEntityId?: string;
}

export class ReserveDto {
  @ApiProperty({ description: 'Сумма резервирования', example: '500.00' })
  @IsDecimal({ decimal_digits: '2' })
  @Type(() => String)
  amount: string;

  @ApiProperty({ description: 'Описание операции', example: 'Резервирование средств для задания' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Idempotency key' })
  @IsUUID()
  idempotencyKey: string;

  @ApiProperty({ description: 'ID связанной сущности (task, deal, etc.)' })
  @IsUUID()
  relatedEntityId: string;
}

export class ReleaseDto {
  @ApiProperty({ description: 'ID транзакции резервирования', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  reserveTransactionId: string;

  @ApiProperty({ description: 'Описание операции', example: 'Освобождение резерва' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Idempotency key' })
  @IsUUID()
  idempotencyKey: string;
}

export class RewardDto {
  @ApiProperty({ description: 'ID пользователя-получателя', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'Сумма вознаграждения', example: '100.00' })
  @IsDecimal({ decimal_digits: '2' })
  @Type(() => String)
  amount: string;

  @ApiProperty({ description: 'Описание операции', example: 'Вознаграждение за выполнение задания' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Idempotency key' })
  @IsUUID()
  idempotencyKey: string;

  @ApiProperty({ description: 'ID связанной сущности (task)' })
  @IsUUID()
  relatedEntityId: string;
}

export class PayToOwnerDto {
  @ApiProperty({ description: 'ID владельца площадки', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  ownerId: string;

  @ApiProperty({ description: 'Сумма выплаты', example: '900.00' })
  @IsDecimal({ decimal_digits: '2' })
  @Type(() => String)
  amount: string;

  @ApiProperty({ description: 'Описание операции', example: 'Выплата за рекламное размещение' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Idempotency key' })
  @IsUUID()
  idempotencyKey: string;

  @ApiProperty({ description: 'ID связанной сущности (deal)' })
  @IsUUID()
  relatedEntityId: string;
}

export class RequestPayoutDto {
  @ApiProperty({ description: 'Сумма вывода', example: '1000.00' })
  @IsDecimal({ decimal_digits: '2' })
  @Type(() => String)
  amount: string;

  @ApiProperty({ description: 'Метод выплаты (card, sbp, etc.)', example: 'card' })
  @IsString()
  paymentMethod: string;

  @ApiProperty({ description: 'Реквизиты для выплаты', example: { cardNumber: '****1234' } })
  requisites: Record<string, any>;

  @ApiProperty({ description: 'Idempotency key' })
  @IsUUID()
  idempotencyKey: string;
}

export class RefundDto {
  @ApiProperty({ description: 'ID транзакции для возврата', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  originalTransactionId: string;

  @ApiProperty({ description: 'Сумма возврата (если null, полный возврат)', required: false })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Type(() => String)
  amount?: string;

  @ApiProperty({ description: 'Описание операции', example: 'Возврат средств' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Idempotency key' })
  @IsUUID()
  idempotencyKey: string;
}
