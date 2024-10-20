import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { forkJoin, map, Observable } from 'rxjs';
import { EarthquakeEaterService } from 'src/Application/earthquake_eater.service';
import { GdacsService } from 'src/Application/gdacs.service';
import { UsgsService } from 'src/Application/usgs.service';
import { Earthquake } from 'src/Domain/Model/earthquake.model';

@Injectable()
export class EarthquakeJob {
  constructor(
    private readonly gdacsService: GdacsService,
    private readonly usgsService: UsgsService,
    private readonly earthquakeEaterService: EarthquakeEaterService,
  ) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  @Cron('0 */3 * * * *')
  getAllEarthquakeData(): Observable<Earthquake[]> {
    console.log("Let's search some earthquakes");
    return forkJoin({
      gdacs: this.gdacsService.getEarthquakeData(),
      usgs: this.usgsService.getEarthquakeData(),
    }).pipe(
      map((results) => {
        // Combine results from both sources
        const combinedData = [...results.gdacs, ...results.usgs];

        this.earthquakeEaterService.bulkRecord(combinedData);

        console.log(combinedData.length + 'séismes trouvés.');

        return combinedData;
      }),
    );
  }
}
