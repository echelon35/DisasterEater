import { Eruption } from 'src/Domain/Model/eruption.model';
import { Controller, Get } from '@nestjs/common';
import { EruptionJob } from 'src/Cron/eruption_job.service';

@Controller('eruption')
export class EruptionController {
  constructor(private readonly eruptionJob: EruptionJob) {}

  @Get('data')
  getAllEruptionData(): Promise<Eruption[]> {
    return this.eruptionJob.getAllEruptionData();
  }
}
