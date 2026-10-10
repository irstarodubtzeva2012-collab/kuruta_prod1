import { IsString, IsNotEmpty, IsOptional, IsDateString, IsObject, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BookSlotDto {
  @ApiProperty({ description: 'Дата начала размещения', example: '2024-02-01' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ description: 'Дата окончания размещения', example: '2024-02-02' })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiProperty({ description: 'Краткое описание контента', required: false })
  @IsOptional()
  @IsString()
  contentBrief?: string;

  @ApiProperty({ description: 'Idempotency key' })
  @IsString()
  @IsNotEmpty()
  idempotencyKey: string;
}

export class ConfirmDealDto {
  @ApiProperty({ description: 'Доказательство выполнения (скриншоты, ссылки)', example: { links: ['https://...'], screenshots: ['...'] } })
  @IsObject()
  @IsNotEmpty()
  proofData: any;

  @ApiProperty({ description: 'Idempotency key' })
  @IsString()
  @IsNotEmpty()
  idempotencyKey: string;
}

export class ReviewDealDto {
  @ApiProperty({ description: 'Решение модератора', enum: ['approved', 'rejected'] })
  @IsString()
  @IsNotEmpty()
  decision: 'approved' | 'rejected';

  @ApiProperty({ description: 'Комментарий модератора', required: false })
  @IsOptional()
  @IsString()
  reviewNotes?: string;

  @ApiProperty({ description: 'Idempotency key' })
  @IsString()
  @IsNotEmpty()
  idempotencyKey: string;
}

export class RepurchaseDto {
  @ApiProperty({ description: 'ID предыдущей сделки для повторной покупки' })
  @IsUUID()
  @IsNotEmpty()
  previousDealId: string;

  @ApiProperty({ description: 'Дата начала размещения', example: '2024-03-01' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ description: 'Дата окончания размещения', example: '2024-03-02' })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiProperty({ description: 'Idempotency key' })
  @IsString()
  @IsNotEmpty()
  idempotencyKey: string;
}
