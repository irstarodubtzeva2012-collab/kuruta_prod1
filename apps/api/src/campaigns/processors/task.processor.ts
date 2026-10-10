import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { TasksService } from '../tasks.service';

@Processor('task-queue')
export class TaskProcessor {
  private readonly logger = new Logger(TaskProcessor.name);

  constructor(private readonly tasksService: TasksService) {}

  /**
   * Проверка просроченных задач
   */
  @Process('check-overdue')
  async handleCheckOverdue(job: Job<{ taskId: string }>) {
    this.logger.log(`Processing overdue check for task: ${job.data.taskId}`);

    try {
      await this.tasksService.handleOverdueTask(job.data.taskId);
      this.logger.log(`Overdue check completed for task: ${job.data.taskId}`);
    } catch (error) {
      this.logger.error(`Error processing overdue check for task ${job.data.taskId}: ${error.message}`);
      throw error;
    }
  }
}
