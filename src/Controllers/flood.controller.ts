import { Controller, Get } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Flood } from 'src/Domain/Model/flood.model';
import { Cron } from '@nestjs/schedule';
import { FloodJob } from 'src/Cron/flood_job.service';

@Controller('flood')
export class FloodController {
  constructor(private readonly floodJob: FloodJob) {}

  @Cron('0 */20 * * * *')
  @Get('data')
  getAllInondationData(): Observable<Flood[]> {
    return this.floodJob.getAllInondationData();
  }
}
