import { Controller, Get, Post, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { TakeTaskDto, SubmitProofDto } from './dto/task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { TaskStatus } from '@prisma/client';

@ApiTags('tasks')
@Controller('tasks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('available')
  @ApiOperation({ summary: 'Получение списка доступных задач' })
  @ApiResponse({ status: 200, description: 'Список доступных задач' })
  @ApiQuery({ name: 'campaignId', required: false })
  async getAvailableTasks(
    @CurrentUser('id') ambassadorId: string,
    @Query('campaignId') campaignId?: string,
  ) {
    return this.tasksService.getAvailableTasks(ambassadorId, campaignId);
  }

  @Get('my')
  @ApiOperation({ summary: 'Получение задач амбассадора' })
  @ApiResponse({ status: 200, description: 'Список задач амбассадора' })
  @ApiQuery({ name: 'status', required: false, enum: TaskStatus })
  async getAmbassadorTasks(
    @CurrentUser('id') ambassadorId: string,
    @Query('status') status?: TaskStatus,
  ) {
    return this.tasksService.getAmbassadorTasks(ambassadorId, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получение задачи' })
  @ApiResponse({ status: 200, description: 'Задача' })
  async getTask(@Param('id') id: string) {
    return this.tasksService.getTask(id);
  }

  @Post(':id/take')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Взятие задачи' })
  @ApiResponse({ status: 200, description: 'Задача взята' })
  async takeTask(
    @CurrentUser('id') ambassadorId: string,
    @Param('id') id: string,
    @Body() dto: TakeTaskDto,
  ) {
    return this.tasksService.takeTask(ambassadorId, id, dto.idempotencyKey);
  }

  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Отправка доказательства выполнения' })
  @ApiResponse({ status: 200, description: 'Доказательство отправлено' })
  async submitProof(
    @CurrentUser('id') ambassadorId: string,
    @Param('id') id: string,
    @Body() dto: SubmitProofDto,
  ) {
    return this.tasksService.submitProof(ambassadorId, id, dto.proofData, dto.idempotencyKey);
  }
}
