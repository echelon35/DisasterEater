import { Controller, Get } from '@nestjs/common';
import { Flood } from 'src/Domain/Model/flood.model';
import { FloodJob } from 'src/Cron/flood_job.service';

@Controller('flood')
export class FloodController {
  constructor(private readonly floodJob: FloodJob) {}

  @Get('data')
  getAllInondationData(): Promise<Flood[]> {
    return this.floodJob.getAllInondationData();
  }
}
