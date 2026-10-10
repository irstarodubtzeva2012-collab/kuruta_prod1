import { Controller, Get, Post, Body, UseGuards, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FinanceService } from './finance.service';
import {
  DepositDto,
  ReserveDto,
  ReleaseDto,
  RewardDto,
  PayToOwnerDto,
  RequestPayoutDto,
  RefundDto,
} from './dto/finance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { FinancialTransactionType, FinancialTransactionStatus } from '@kuruta/database';

@ApiTags('finance')
@Controller('finance')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('balance')
  @ApiOperation({ summary: 'Получить баланс текущего пользователя' })
  @ApiResponse({ status: 200, description: 'Баланс пользователя' })
  async getBalance(@CurrentUser('id') userId: string) {
    const balance = await this.financeService.getBalance(userId);
    return { balance: balance.toString(), currency: 'RUB' };
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Получить историю транзакций' })
  @ApiResponse({ status: 200, description: 'Список транзакций' })
  @ApiQuery({ name: 'type', required: false, enum: FinancialTransactionType })
  @ApiQuery({ name: 'status', required: false, enum: FinancialTransactionStatus })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async getTransactions(
    @CurrentUser('id') userId: string,
    @Query('type') type?: FinancialTransactionType,
    @Query('status') status?: FinancialTransactionStatus,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.financeService.getTransactions(userId, {
      type,
      status,
      limit,
      offset,
    });
  }

  @Post('deposit')
  @ApiOperation({ summary: 'Пополнение баланса' })
  @ApiResponse({ status: 201, description: 'Транзакция создана' })
  async deposit(@CurrentUser('id') userId: string, @Body() dto: DepositDto) {
    return this.financeService.deposit({
      userId,
      amount: dto.amount,
      description: dto.description,
      idempotencyKey: dto.idempotencyKey,
      relatedEntityId: dto.relatedEntityId,
    });
  }

  @Post('reserve')
  @ApiOperation({ summary: 'Резервирование средств' })
  @ApiResponse({ status: 201, description: 'Средства зарезервированы' })
  async reserve(@CurrentUser('id') userId: string, @Body() dto: ReserveDto) {
    return this.financeService.reserve({
      userId,
      amount: dto.amount,
      description: dto.description,
      idempotencyKey: dto.idempotencyKey,
      relatedEntityType: 'task',
      relatedEntityId: dto.relatedEntityId,
    });
  }

  @Post('release')
  @ApiOperation({ summary: 'Освобождение резерва' })
  @ApiResponse({ status: 201, description: 'Резерв освобождён' })
  async release(@CurrentUser('id') userId: string, @Body() dto: ReleaseDto) {
    // Получаем оригинальную транзакцию резервирования
    // В реальном приложении нужно получить relatedEntityId из транзакции
    return this.financeService.release({
      userId,
      amount: '0', // Нужно получить из оригинальной транзакции
      description: dto.description,
      idempotencyKey: dto.idempotencyKey,
      relatedEntityType: 'task',
      relatedEntityId: dto.reserveTransactionId,
    });
  }

  @Post('reward')
  @UseGuards(RolesGuard)
  @Roles('admin', 'moderator', 'finance')
  @ApiOperation({ summary: 'Начисление вознаграждения (для модераторов)' })
  @ApiResponse({ status: 201, description: 'Вознаграждение начислено' })
  async reward(@Body() dto: RewardDto) {
    return this.financeService.reward({
      userId: dto.userId,
      amount: dto.amount,
      description: dto.description,
      idempotencyKey: dto.idempotencyKey,
      relatedEntityType: 'task',
      relatedEntityId: dto.relatedEntityId,
    });
  }

  @Post('pay-to-owner')
  @UseGuards(RolesGuard)
  @Roles('admin', 'moderator', 'finance')
  @ApiOperation({ summary: 'Выплата владельцу площадки (для модераторов)' })
  @ApiResponse({ status: 201, description: 'Выплата произведена' })
  async payToOwner(@Body() dto: PayToOwnerDto) {
    return this.financeService.payToOwner({
      ownerId: dto.ownerId,
      amount: dto.amount,
      description: dto.description,
      idempotencyKey: dto.idempotencyKey,
      relatedEntityType: 'deal',
      relatedEntityId: dto.relatedEntityId,
    });
  }

  @Post('payout')
  @ApiOperation({ summary: 'Запрос на вывод средств' })
  @ApiResponse({ status: 201, description: 'Заявка на вывод создана' })
  async requestPayout(@CurrentUser('id') userId: string, @Body() dto: RequestPayoutDto) {
    return this.financeService.requestPayout({
      userId,
      amount: dto.amount,
      paymentMethod: dto.paymentMethod,
      requisites: dto.requisites,
      idempotencyKey: dto.idempotencyKey,
    });
  }

  @Post('payout/:id/complete')
  @UseGuards(RolesGuard)
  @Roles('admin', 'finance')
  @ApiOperation({ summary: 'Завершение вывода средств (для финансистов)' })
  @ApiResponse({ status: 200, description: 'Вывод завершён' })
  async completePayout(
    @Param('id') payoutRequestId: string,
    @CurrentUser('id') processedBy: string,
  ) {
    return this.financeService.completePayout({
      payoutRequestId,
      processedBy,
    });
  }

  @Post('refund')
  @UseGuards(RolesGuard)
  @Roles('admin', 'moderator', 'finance')
  @ApiOperation({ summary: 'Возврат средств (для модераторов)' })
  @ApiResponse({ status: 201, description: 'Возврат произведён' })
  async refund(@CurrentUser('id') userId: string, @Body() dto: RefundDto) {
    return this.financeService.refund({
      userId,
      originalTransactionId: dto.originalTransactionId,
      amount: dto.amount,
      description: dto.description,
      idempotencyKey: dto.idempotencyKey,
    });
  }

  @Post('reconcile')
  @UseGuards(RolesGuard)
  @Roles('admin', 'finance')
  @ApiOperation({ summary: 'Сверка баланса (для администраторов)' })
  @ApiResponse({ status: 200, description: 'Сверка выполнена' })
  async reconcile(@CurrentUser('id') userId: string) {
    return this.financeService.reconcile(userId);
  }
}
