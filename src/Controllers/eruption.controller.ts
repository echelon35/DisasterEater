import { Observable } from 'rxjs';
import { Eruption } from 'src/Domain/Model/eruption.model';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Controller, Get } from '@nestjs/common';
import { EruptionJob } from 'src/Cron/eruption_job.service';

@Controller('eruption')
export class EruptionController {
  constructor(private readonly eruptionJob: EruptionJob) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  @Get('data')
  getAllEruptionData(): Observable<Eruption[]> {
    return this.eruptionJob.getAllEruptionData();
  }
}
