import { GdacsService } from '../Application/gdacs.service';
import { forkJoin, map, Observable } from 'rxjs';
import { Flood } from 'src/Domain/Model/flood.model';
import { FloodEaterService } from 'src/Application/flood_eater.service';
import { Cron } from '@nestjs/schedule';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FloodJob {
  constructor(
    private readonly gdacsService: GdacsService,
    private readonly floodEaterService: FloodEaterService,
  ) {}

  @Cron('0 */20 * * * *')
  getAllInondationData(): Observable<Flood[]> {
    console.log("Let's search some floods");
    return forkJoin({
      gdacs: this.gdacsService.getFloodData(),
    }).pipe(
      map((results) => {
        // Combine results from both sources
        const combinedData = [...results.gdacs];
        console.log(combinedData.length + 'inondations trouvées.');

        this.floodEaterService.bulkRecord(combinedData);

        return combinedData;
      }),
    );
  }
}
