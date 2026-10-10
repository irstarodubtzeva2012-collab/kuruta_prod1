import { IsString, IsOptional, IsEnum, IsUUID, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ModerationEntityType {
  CAMPAIGN = 'campaign',
  TASK = 'task',
  AD_SLOT = 'ad_slot',
  DEAL = 'deal',
  AMBASSADOR = 'ambassador',
  PLATFORM_OWNER = 'platform_owner',
}

export enum ModerationStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export class GetModerationQueueDto {
  @ApiProperty({ required: false, enum: ModerationEntityType })
  @IsOptional()
  @IsEnum(ModerationEntityType)
  entityType?: ModerationEntityType;

  @ApiProperty({ required: false, enum: ModerationStatus })
  @IsOptional()
  @IsEnum(ModerationStatus)
  status?: ModerationStatus;

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

export class ModerateItemDto {
  @ApiProperty({ description: 'Решение модератора' })
  @IsString()
  decision: string;

  @ApiProperty({ required: false, description: 'Комментарий модератора' })
  @IsOptional()
  @IsString()
  comment?: string;
}
