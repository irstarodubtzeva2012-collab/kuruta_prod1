import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ModerationService } from './moderation.service';
import { GetModerationQueueDto, ModerateItemDto } from './dto/moderation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('moderation')
@Controller('moderation')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('moderator', 'admin')
@ApiBearerAuth()
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) {}

  @Get('queue')
  @ApiOperation({ summary: 'Получить очередь модерации' })
  @ApiResponse({ status: 200, description: 'Очередь модерации' })
  async getQueue(@Query() filters: GetModerationQueueDto) {
    return this.moderationService.getQueue(filters);
  }

  @Post('queue/:id/assign')
  @ApiOperation({ summary: 'Назначить модератора на задачу' })
  @ApiResponse({ status: 200, description: 'Задача назначена' })
  async assignToModerator(
    @CurrentUser('id') moderatorId: string,
    @Param('id') queueId: string,
  ) {
    return this.moderationService.assignToModerator(moderatorId, queueId);
  }

  @Post('queue/:id/approve')
  @ApiOperation({ summary: 'Одобрить элемент очереди' })
  @ApiResponse({ status: 200, description: 'Элемент одобрен' })
  async approve(
    @CurrentUser('id') moderatorId: string,
    @Param('id') queueId: string,
    @Body() dto: ModerateItemDto,
  ) {
    return this.moderationService.approve(moderatorId, queueId, dto);
  }

  @Post('queue/:id/reject')
  @ApiOperation({ summary: 'Отклонить элемент очереди' })
  @ApiResponse({ status: 200, description: 'Элемент отклонён' })
  async reject(
    @CurrentUser('id') moderatorId: string,
    @Param('id') queueId: string,
    @Body() dto: ModerateItemDto,
  ) {
    return this.moderationService.reject(moderatorId, queueId, dto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Получить статистику модератора' })
  @ApiResponse({ status: 200, description: 'Статистика модератора' })
  async getModeratorStats(@CurrentUser('id') moderatorId: string) {
    return this.moderationService.getModeratorStats(moderatorId);
  }
}
