import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AntiFraudService } from './anti-fraud.service';
import { GetAntiFraudSignalsDto, ReviewAntiFraudSignalDto } from './dto/anti-fraud.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('anti-fraud')
@Controller('anti-fraud')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('moderator', 'admin')
@ApiBearerAuth()
export class AntiFraudController {
  constructor(private readonly antiFraudService: AntiFraudService) {}

  @Get('signals')
  @ApiOperation({ summary: 'Получить список антифрод-сигналов' })
  @ApiResponse({ status: 200, description: 'Список сигналов' })
  async getSignals(@Query() filters: GetAntiFraudSignalsDto) {
    return this.antiFraudService.getSignals(filters);
  }

  @Post('signals/:id/review')
  @ApiOperation({ summary: 'Проверить антифрод-сигнал' })
  @ApiResponse({ status: 200, description: 'Сигнал проверен' })
  async reviewSignal(
    @CurrentUser('id') moderatorId: string,
    @Param('id') signalId: string,
    @Body() dto: ReviewAntiFraudSignalDto,
  ) {
    return this.antiFraudService.reviewSignal(moderatorId, signalId, dto);
  }

  @Post('schedule')
  @ApiOperation({ summary: 'Запустить планирование антифрод-проверок' })
  @ApiResponse({ status: 200, description: 'Проверки запланированы' })
  async scheduleChecks() {
    await this.antiFraudService.scheduleAntiFraudChecks();
    return { success: true, message: 'Anti-fraud checks scheduled' };
  }
}
