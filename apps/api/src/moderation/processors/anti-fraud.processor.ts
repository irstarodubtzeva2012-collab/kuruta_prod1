import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { AntiFraudService } from '../anti-fraud.service';

@Processor('anti-fraud-queue')
export class AntiFraudProcessor {
  private readonly logger = new Logger(AntiFraudProcessor.name);

  constructor(private readonly antiFraudService: AntiFraudService) {}

  @Process('check-duplicate-devices')
  async handleCheckDuplicateDevices(job: Job) {
    this.logger.log('Processing duplicate devices check...');
    try {
      await this.antiFraudService.checkDuplicateDevices();
      this.logger.log('Duplicate devices check completed');
    } catch (error) {
      this.logger.error('Error in duplicate devices check', error.stack);
      throw error;
    }
  }

  @Process('check-fast-completions')
  async handleCheckFastCompletions(job: Job) {
    this.logger.log('Processing fast completions check...');
    try {
      await this.antiFraudService.checkFastCompletions();
      this.logger.log('Fast completions check completed');
    } catch (error) {
      this.logger.error('Error in fast completions check', error.stack);
      throw error;
    }
  }

  @Process('check-duplicate-screenshots')
  async handleCheckDuplicateScreenshots(job: Job) {
    this.logger.log('Processing duplicate screenshots check...');
    try {
      await this.antiFraudService.checkDuplicateScreenshots();
      this.logger.log('Duplicate screenshots check completed');
    } catch (error) {
      this.logger.error('Error in duplicate screenshots check', error.stack);
      throw error;
    }
  }

  @Process('check-duplicate-requisites')
  async handleCheckDuplicateRequisites(job: Job) {
    this.logger.log('Processing duplicate requisites check...');
    try {
      await this.antiFraudService.checkDuplicateRequisites();
      this.logger.log('Duplicate requisites check completed');
    } catch (error) {
      this.logger.error('Error in duplicate requisites check', error.stack);
      throw error;
    }
  }
}
