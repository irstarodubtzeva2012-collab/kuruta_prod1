import { Controller, Get, Post, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ModerationService } from './moderation.service';
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
  @ApiOperation({ summary: 'Получение очереди модерации' })
  @ApiResponse({ status: 200, description: 'Очередь модерации' })
  @ApiQuery({ name: 'entityType', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'offset', required: false })
  async getModerationQueue(
    @Query('entityType') entityType?: string,
    @Query('status') status?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.moderationService.getModerationQueue({
      entityType,
      status,
      limit,
      offset,
    });
  }

  @Post('approve/:entityType/:entityId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Одобрение элемента очереди' })
  @ApiResponse({ status: 200, description: 'Элемент одобрен' })
  async approveItem(
    @CurrentUser('id') moderatorId: string,
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Body('reviewNotes') reviewNotes?: string,
  ) {
    return this.moderationService.approveItem(moderatorId, entityId, entityType, reviewNotes);
  }

  @Post('reject/:entityType/:entityId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Отклонение элемента очереди' })
  @ApiResponse({ status: 200, description: 'Элемент отклонён' })
  async rejectItem(
    @CurrentUser('id') moderatorId: string,
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Body('reason') reason: string,
  ) {
    return this.moderationService.rejectItem(moderatorId, entityId, entityType, reason);
  }
}
