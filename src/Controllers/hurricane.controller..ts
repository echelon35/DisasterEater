import { Controller, Get } from '@nestjs/common';
import { Hurricane } from '../Domain/Model/hurricane.model';
import { Observable } from 'rxjs';
import { HurricaneJob } from 'src/Cron/hurricane_job.service';

@Controller('hurricane')
export class HurricaneController {
  constructor(private readonly hurricaneJob: HurricaneJob) {}

  @Get('data')
  getAllHurricaneData(): Observable<Hurricane[]> {
    return this.hurricaneJob.getAllHurricaneData();
  }
}
