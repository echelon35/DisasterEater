import { Earthquake } from 'src/Domain/Model/earthquake.model';
import { Controller, Get } from '@nestjs/common';
import { EarthquakeJob } from 'src/Cron/earthquake_job.service';

@Controller('earthquake')
export class EarthquakeController {
  constructor(private readonly earthquakeJob: EarthquakeJob) {}

  @Get('data')
  getAllEarthquakeData(): Promise<Earthquake[]> {
    return this.earthquakeJob.getAllEarthquakeData();
  }
}
