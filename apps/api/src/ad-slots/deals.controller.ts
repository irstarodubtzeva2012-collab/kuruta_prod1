import { Controller, Get, Post, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DealsService } from './deals.service';
import { BookSlotDto, ConfirmDealDto, ReviewDealDto, RepurchaseDto } from './dto/deal.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { DealStatus } from '@prisma/client';

@ApiTags('deals')
@Controller('deals')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Post('book/:adSlotId')
  @ApiOperation({ summary: 'Бронирование рекламного места' })
  @ApiResponse({ status: 201, description: 'Сделка создана' })
  async bookSlot(
    @CurrentUser('id') buyerId: string,
    @Param('adSlotId') adSlotId: string,
    @Body() dto: BookSlotDto,
  ) {
    return this.dealsService.bookSlot(buyerId, adSlotId, dto);
  }

  @Post('repurchase')
  @ApiOperation({ summary: 'ПОВТОРНАЯ ПОКУПКА: Упрощенная покупка у того же владельца' })
  @ApiResponse({ status: 201, description: 'Сделка создана' })
  async repurchase(
    @CurrentUser('id') buyerId: string,
    @Body() dto: RepurchaseDto,
  ) {
    return this.dealsService.repurchase(buyerId, dto);
  }

  @Post(':id/pay')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Оплата сделки' })
  @ApiResponse({ status: 200, description: 'Сделка оплачена' })
  async payDeal(
    @CurrentUser('id') buyerId: string,
    @Param('id') id: string,
    @Body('idempotencyKey') idempotencyKey: string,
  ) {
    return this.dealsService.payDeal(buyerId, id, idempotencyKey);
  }

  @Post(':id/confirm')
  @UseGuards(RolesGuard)
  @Roles('platform_owner')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Подтверждение выполнения (владельцем)' })
  @ApiResponse({ status: 200, description: 'Сделка подтверждена' })
  async confirmDeal(
    @CurrentUser('id') ownerId: string,
    @Param('id') id: string,
    @Body() dto: ConfirmDealDto,
  ) {
    return this.dealsService.confirmDeal(ownerId, id, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Получение списка своих сделок' })
  @ApiResponse({ status: 200, description: 'Список сделок' })
  @ApiQuery({ name: 'role', required: true, enum: ['buyer', 'owner'] })
  @ApiQuery({ name: 'status', required: false, enum: DealStatus })
  async getUserDeals(
    @CurrentUser('id') userId: string,
    @Query('role') role: 'buyer' | 'owner',
    @Query('status') status?: DealStatus,
  ) {
    return this.dealsService.getUserDeals(userId, role, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получение сделки' })
  @ApiResponse({ status: 200, description: 'Сделка' })
  async getDeal(@Param('id') id: string) {
    return this.dealsService.getDeal(id);
  }
}
