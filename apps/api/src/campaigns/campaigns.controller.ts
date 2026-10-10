import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto, UpdateCampaignDto, SubmitForModerationDto } from './dto/campaign.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CampaignStatus } from '@prisma/client';

@ApiTags('campaigns')
@Controller('campaigns')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  @ApiOperation({ summary: 'Создание кампании' })
  @ApiResponse({ status: 201, description: 'Кампания создана' })
  async createCampaign(
    @CurrentUser('id') creatorId: string,
    @Body() dto: CreateCampaignDto,
  ) {
    return this.campaignsService.createCampaign(creatorId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Получение списка кампаний пользователя' })
  @ApiResponse({ status: 200, description: 'Список кампаний' })
  @ApiQuery({ name: 'status', required: false, enum: CampaignStatus })
  async getUserCampaigns(
    @CurrentUser('id') userId: string,
    @Query('status') status?: CampaignStatus,
  ) {
    return this.campaignsService.getUserCampaigns(userId, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получение кампании' })
  @ApiResponse({ status: 200, description: 'Кампания' })
  async getCampaign(@Param('id') id: string) {
    return this.campaignsService.getCampaign(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Обновление кампании' })
  @ApiResponse({ status: 200, description: 'Кампания обновлена' })
  async updateCampaign(
    @CurrentUser('id') creatorId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCampaignDto,
  ) {
    return this.campaignsService.updateCampaign(creatorId, id, dto);
  }

  @Post(':id/pay')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Оплата кампании (резервирование средств)' })
  @ApiResponse({ status: 200, description: 'Кампания оплачена' })
  async payCampaign(
    @CurrentUser('id') creatorId: string,
    @Param('id') id: string,
    @Body('idempotencyKey') idempotencyKey: string,
  ) {
    return this.campaignsService.payCampaign(creatorId, id, idempotencyKey);
  }

  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Отправка кампании на модерацию' })
  @ApiResponse({ status: 200, description: 'Кампания отправлена на модерацию' })
  async submitForModeration(
    @CurrentUser('id') creatorId: string,
    @Param('id') id: string,
    @Body('idempotencyKey') idempotencyKey: string,
  ) {
    return this.campaignsService.submitForModeration(creatorId, id, idempotencyKey);
  }

  @Post(':id/ambassadors')
  @ApiOperation({ summary: 'Подбор амбассадоров для кампании' })
  @ApiResponse({ status: 200, description: 'Список подходящих амбассадоров' })
  async findAmbassadors(
    @Param('id') id: string,
    @Body() filters: {
      niches?: string[];
      minAudienceSize?: number;
      geo?: string[];
      limit?: number;
    },
  ) {
    return this.campaignsService.findAmbassadors(id, filters);
  }
}
