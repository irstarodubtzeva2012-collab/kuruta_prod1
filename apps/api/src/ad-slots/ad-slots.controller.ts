import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdSlotsService } from './ad-slots.service';
import { CreateAdSlotDto, UpdateAdSlotDto, CatalogFilterDto } from './dto/ad-slot.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AdSlotStatus } from '@prisma/client';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('ad-slots')
@Controller('ad-slots')
export class AdSlotsController {
  constructor(private readonly adSlotsService: AdSlotsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('platform_owner')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создание рекламного места' })
  @ApiResponse({ status: 201, description: 'Рекламное место создано' })
  async createAdSlot(
    @CurrentUser('id') ownerId: string,
    @Body() dto: CreateAdSlotDto,
  ) {
    return this.adSlotsService.createAdSlot(ownerId, dto);
  }

  @Get('catalog')
  @Public()
  @ApiOperation({ summary: 'Публичный каталог рекламных мест (Единый маркетплейс)' })
  @ApiResponse({ status: 200, description: 'Каталог рекламных мест' })
  async getCatalog(
    @CurrentUser('id') userId: string | null,
    @Query() filters: CatalogFilterDto,
  ) {
    return this.adSlotsService.getCatalog(userId, filters);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('platform_owner')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получение списка своих рекламных мест' })
  @ApiResponse({ status: 200, description: 'Список рекламных мест' })
  @ApiQuery({ name: 'status', required: false, enum: AdSlotStatus })
  async getOwnerAdSlots(
    @CurrentUser('id') ownerId: string,
    @Query('status') status?: AdSlotStatus,
  ) {
    return this.adSlotsService.getOwnerAdSlots(ownerId, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получение рекламного места' })
  @ApiResponse({ status: 200, description: 'Рекламное место' })
  async getAdSlot(@Param('id') id: string) {
    return this.adSlotsService.getAdSlot(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('platform_owner')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновление рекламного места' })
  @ApiResponse({ status: 200, description: 'Рекламное место обновлено' })
  async updateAdSlot(
    @CurrentUser('id') ownerId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAdSlotDto,
  ) {
    return this.adSlotsService.updateAdSlot(ownerId, id, dto);
  }

  @Post(':id/submit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('platform_owner')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Отправка на модерацию' })
  @ApiResponse({ status: 200, description: 'Отправлено на модерацию' })
  async submitForModeration(
    @CurrentUser('id') ownerId: string,
    @Param('id') id: string,
  ) {
    return this.adSlotsService.submitForModeration(ownerId, id);
  }

  @Get(':id/availability')
  @ApiOperation({ summary: 'Проверка доступности на даты' })
  @ApiResponse({ status: 200, description: 'Доступность' })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  async checkAvailability(
    @Param('id') id: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.adSlotsService.checkAvailability(id, new Date(startDate), new Date(endDate));
  }
}
