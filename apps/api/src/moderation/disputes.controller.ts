import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DisputesService } from './disputes.service';
import { OpenDisputeDto, ResolveDisputeDto } from './dto/disputes.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { DisputeStatus } from '@prisma/client';

@ApiTags('disputes')
@Controller('disputes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DisputesController {
  constructor(private readonly disputesService: DisputesService) {}

  @Post()
  @ApiOperation({ summary: 'Открыть спор' })
  @ApiResponse({ status: 201, description: 'Спор открыт' })
  async openDispute(
    @CurrentUser('id') userId: string,
    @Body() dto: OpenDisputeDto,
  ) {
    return this.disputesService.openDispute(userId, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Получить мои споры' })
  @ApiResponse({ status: 200, description: 'Список споров' })
  async getUserDisputes(@CurrentUser('id') userId: string) {
    return this.disputesService.getUserDisputes(userId);
  }

  @Get('all')
  @UseGuards(RolesGuard)
  @Roles('moderator', 'admin')
  @ApiOperation({ summary: 'Получить все споры (для модераторов)' })
  @ApiResponse({ status: 200, description: 'Список всех споров' })
  async getAllDisputes(@Query('status') status?: DisputeStatus) {
    return this.disputesService.getAllDisputes(status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить спор' })
  @ApiResponse({ status: 200, description: 'Спор' })
  async getDispute(@Param('id') disputeId: string) {
    return this.disputesService.getDispute(disputeId);
  }

  @Post(':id/resolve')
  @UseGuards(RolesGuard)
  @Roles('moderator', 'admin')
  @ApiOperation({ summary: 'Разрешить спор' })
  @ApiResponse({ status: 200, description: 'Спор разрешён' })
  async resolveDispute(
    @CurrentUser('id') moderatorId: string,
    @Param('id') disputeId: string,
    @Body() dto: ResolveDisputeDto,
  ) {
    return this.disputesService.resolveDispute(moderatorId, disputeId, dto);
  }
}
