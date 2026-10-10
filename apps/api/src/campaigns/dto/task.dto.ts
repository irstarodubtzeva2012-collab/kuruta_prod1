import { IsString, IsNotEmpty, IsOptional, IsObject, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TakeTaskDto {
  @ApiProperty({ description: 'Idempotency key' })
  @IsString()
  @IsNotEmpty()
  idempotencyKey: string;
}

export class SubmitProofDto {
  @ApiProperty({ description: 'Данные доказательства выполнения', example: { links: ['https://...'], screenshots: ['...'] } })
  @IsObject()
  @IsNotEmpty()
  proofData: any;

  @ApiProperty({ description: 'Idempotency key' })
  @IsString()
  @IsNotEmpty()
  idempotencyKey: string;
}

export class ReviewTaskDto {
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

export class FindAmbassadorsDto {
  @ApiProperty({ description: 'Темы/ниши', required: false })
  @IsOptional()
  @IsArray()
  niches?: string[];

  @ApiProperty({ description: 'Минимальный размер аудитории', required: false })
  @IsOptional()
  @IsNumber()
  minAudienceSize?: number;

  @ApiProperty({ description: 'Гео', required: false })
  @IsOptional()
  @IsArray()
  geo?: string[];

  @ApiProperty({ description: 'Лимит результатов', required: false })
  @IsOptional()
  @IsNumber()
  limit?: number;
}
