import { Controller, Get } from '@nestjs/common';
import { GdacsService } from '../Application/gdacs.service';
import { UsgsService } from '../Application/usgs.service';
import { Observable, forkJoin, map } from 'rxjs';
import { Earthquake } from 'src/Domain/Model/earthquake.model';
import { EarthquakeEaterService } from 'src/Application/earthquake_eater.service';

@Controller('earthquake')
export class EarthquakeController {
  constructor(
    private readonly gdacsService: GdacsService,
    private readonly usgsService: UsgsService,
    private readonly earthquakeEaterService: EarthquakeEaterService,
  ) {}

  @Get('data')
  getAllEarthquakeData(): Observable<Earthquake[]> {
    return forkJoin({
      gdacs: this.gdacsService.getEarthquakeData(),
      usgs: this.usgsService.getEarthquakeData(),
    }).pipe(
      map((results) => {
        // Combine results from both sources
        const combinedData = [...results.gdacs, ...results.usgs];

        this.earthquakeEaterService.bulkRecord(combinedData);

        return combinedData;
      }),
    );
  }
}
