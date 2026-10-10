import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, Min, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CampaignStatus } from '@prisma/client';

export class CreateCampaignDto {
  @ApiProperty({ description: 'Название кампании', example: 'Продвижение нового продукта' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Описание кампании', example: 'Необходимо создать контент для продвижения...' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Общий бюджет кампании', example: 10000 })
  @IsNumber()
  @Min(1)
  budget: number;

  @ApiProperty({ description: 'Количество заданий', example: 10 })
  @IsNumber()
  @Min(1)
  taskCount: number;

  @ApiProperty({ description: 'Вознаграждение за одно задание', example: 1000 })
  @IsNumber()
  @Min(1)
  taskReward: number;

  @ApiProperty({ description: 'Требования к заданиям', required: false })
  @IsOptional()
  requirements?: any;

  @ApiProperty({ description: 'Целевая аудитория', required: false })
  @IsOptional()
  targetAudience?: any;

  @ApiProperty({ description: 'Дата начала', required: false })
  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @ApiProperty({ description: 'Дата окончания', required: false })
  @IsOptional()
  @IsDateString()
  endsAt?: string;
}

export class UpdateCampaignDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  requirements?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  targetAudience?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  endsAt?: string;
}

export class SubmitForModerationDto {
  @ApiProperty({ description: 'Idempotency key' })
  @IsString()
  @IsNotEmpty()
  idempotencyKey: string;
}
