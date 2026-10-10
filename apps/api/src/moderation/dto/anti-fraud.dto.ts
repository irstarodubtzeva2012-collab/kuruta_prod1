import { IsString, IsEnum, IsOptional, IsNumber, Min, IsUUID, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum AntiFraudSignalType {
  DUPLICATE_DEVICE_FINGERPRINT = 'duplicate_device_fingerprint',
  DUPLICATE_PAYOUT_REQUISITES = 'duplicate_payout_requisites',
  SUSPICIOUS_FAST_COMPLETION = 'suspicious_fast_completion',
  DUPLICATE_PROOF_SCREENSHOTS = 'duplicate_proof_screenshots',
  SUDDEN_AUDIENCE_GROWTH = 'sudden_audience_growth',
  UNUSUAL_ACTIVITY_PATTERN = 'unusual_activity_pattern',
}

export enum AntiFraudSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum AntiFraudStatus {
  PENDING = 'pending',
  INVESTIGATING = 'investigating',
  CONFIRMED = 'confirmed',
  DISMISSED = 'dismissed',
}

export class GetAntiFraudSignalsDto {
  @ApiProperty({ required: false, enum: AntiFraudSignalType })
  @IsOptional()
  @IsEnum(AntiFraudSignalType)
  type?: AntiFraudSignalType;

  @ApiProperty({ required: false, enum: AntiFraudSeverity })
  @IsOptional()
  @IsEnum(AntiFraudSeverity)
  severity?: AntiFraudSeverity;

  @ApiProperty({ required: false, enum: AntiFraudStatus })
  @IsOptional()
  @IsEnum(AntiFraudStatus)
  status?: AntiFraudStatus;

  @ApiProperty({ required: false, default: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;

  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number;
}

export class ReviewAntiFraudSignalDto {
  @ApiProperty({ description: 'Статус', enum: AntiFraudStatus })
  @IsEnum(AntiFraudStatus)
  status: AntiFraudStatus;

  @ApiProperty({ required: false, description: 'Комментарий модератора' })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({ required: false, description: 'Дополнительные данные' })
  @IsOptional()
  @IsObject()
  metadata?: any;
}

export class CreateAntiFraudSignalDto {
  @ApiProperty({ description: 'Тип сигнала', enum: AntiFraudSignalType })
  @IsEnum(AntiFraudSignalType)
  type: AntiFraudSignalType;

  @ApiProperty({ required: false, description: 'ID пользователя' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({ description: 'Severity', enum: AntiFraudSeverity })
  @IsEnum(AntiFraudSeverity)
  severity: AntiFraudSeverity;

  @ApiProperty({ description: 'Заголовок' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Описание' })
  @IsString()
  description: string;

  @ApiProperty({ required: false, description: 'Метаданные' })
  @IsOptional()
  @IsObject()
  metadata?: any;
}
