import { IsString, IsNotEmpty, IsOptional, IsNumber, IsObject, Min, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateAdSlotDto {
  @ApiProperty({ description: 'ID платформы', example: 'uuid-platform' })
  @IsString()
  @IsNotEmpty()
  platformId: string;

  @ApiProperty({ description: 'Название рекламного места', example: 'Пост в Telegram канале' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Описание', example: 'Размещение поста в канале с аудиторией 50к' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Цена за размещение (комиссия платформы добавляется сверху)', example: 5000 })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  price: number;

  @ApiProperty({ description: 'Формат размещения', example: 'post', enum: ['post', 'story', 'reel', 'video', 'mention'] })
  @IsString()
  @IsNotEmpty()
  format: string;

  @ApiProperty({ description: 'Длительность размещения (дни)', example: 1 })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  duration: number;

  @ApiProperty({ description: 'Доступные даты (calendar)', required: false })
  @IsOptional()
  @IsObject()
  availability?: any;

  @ApiProperty({ description: 'Требования к контенту', required: false })
  @IsOptional()
  @IsObject()
  requirements?: any;
}

export class UpdateAdSlotDto {
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
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  price?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  availability?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  requirements?: any;
}

export class CatalogFilterDto {
  @ApiProperty({ description: 'Тип платформы', required: false, example: 'telegram' })
  @IsOptional()
  @IsString()
  platformType?: string;

  @ApiProperty({ description: 'Минимальная цена', required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minPrice?: number;

  @ApiProperty({ description: 'Максимальная цена', required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxPrice?: number;

  @ApiProperty({ description: 'Минимальный размер аудитории', required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minAudienceSize?: number;

  @ApiProperty({ description: 'Формат размещения', required: false })
  @IsOptional()
  @IsString()
  format?: string;

  @ApiProperty({ description: 'Лимит результатов', required: false, default: 20 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;

  @ApiProperty({ description: 'Смещение', required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  offset?: number;
}
