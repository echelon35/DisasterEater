import { Injectable } from '@nestjs/common';
import { GdacsService } from '../Application/gdacs.service';
import { Hurricane } from '../Domain/Model/hurricane.model';
import { Observable, forkJoin, map } from 'rxjs';
import { HurricaneEaterService } from 'src/Application/hurricane_eater.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class HurricaneJob {
  constructor(
    private readonly gdacsService: GdacsService,
    private readonly hurricaneEaterService: HurricaneEaterService,
  ) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  getAllHurricaneData(): Observable<Hurricane[]> {
    console.log("Let's search some hurricanes");
    return forkJoin({
      gdacs: this.gdacsService.getHurricaneData(),
    }).pipe(
      map((results) => {
        // Combine results from both sources
        const combinedData = [...results.gdacs];

        console.log(combinedData.length + 'cyclones trouvés.');
        this.hurricaneEaterService.bulkRecord(combinedData);

        return combinedData;
      }),
    );
  }
}
