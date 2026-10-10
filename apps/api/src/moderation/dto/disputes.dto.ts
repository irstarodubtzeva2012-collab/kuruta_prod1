import { IsString, IsEnum, IsUUID, IsOptional, IsObject, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum DisputeEntityType {
  TASK = 'task',
  DEAL = 'deal',
}

export enum DisputeStatus {
  OPENED = 'opened',
  INVESTIGATING = 'investigating',
  RESOLVED_CREATOR = 'resolved_creator',
  RESOLVED_EXECUTOR = 'resolved_executor',
  RESOLVED_PARTIAL = 'resolved_partial',
  CLOSED = 'closed',
}

export enum DisputeResolution {
  IN_FAVOR_OF_CREATOR = 'in_favor_of_creator',
  IN_FAVOR_OF_EXECUTOR = 'in_favor_of_executor',
  PARTIAL_REFUND = 'partial_refund',
}

export class OpenDisputeDto {
  @ApiProperty({ description: 'Тип сущности', enum: DisputeEntityType })
  @IsEnum(DisputeEntityType)
  entityType: DisputeEntityType;

  @ApiProperty({ description: 'ID сущности' })
  @IsUUID()
  entityId: string;

  @ApiProperty({ description: 'Причина спора' })
  @IsString()
  reason: string;

  @ApiProperty({ required: false, description: 'Детали спора' })
  @IsOptional()
  @IsString()
  details?: string;

  @ApiProperty({ required: false, description: 'Доказательства (JSON)' })
  @IsOptional()
  @IsObject()
  evidence?: any;
}

export class ResolveDisputeDto {
  @ApiProperty({ description: 'Решение', enum: DisputeResolution })
  @IsEnum(DisputeResolution)
  resolution: DisputeResolution;

  @ApiProperty({ required: false, description: 'Процент возврата (для partial_refund)', minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  refundPercentage?: number;

  @ApiProperty({ description: 'Комментарий модератора' })
  @IsString()
  comment: string;

  @ApiProperty({ description: 'Idempotency key' })
  @IsString()
  idempotencyKey: string;
}
