import { Controller, Get } from '@nestjs/common';
import { Hurricane } from '../Domain/Model/hurricane.model';
import { HurricaneJob } from 'src/Cron/hurricane_job.service';

@Controller('hurricane')
export class HurricaneController {
  constructor(private readonly hurricaneJob: HurricaneJob) {}

  @Get('data')
  getAllHurricaneData(): Promise<Hurricane[]> {
    return this.hurricaneJob.getAllHurricaneData();
  }
}
