import { GdacsService } from '../Application/gdacs.service';
import { forkJoin, map, Observable } from 'rxjs';
import { Eruption } from 'src/Domain/Model/eruption.model';
import { EruptionEaterService } from 'src/Application/eruption_eater.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EruptionJob {
  constructor(
    private readonly gdacsService: GdacsService,
    private readonly eruptionEaterService: EruptionEaterService,
  ) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  getAllEruptionData(): Observable<Eruption[]> {
    console.log("Let's search some eruptions");
    return forkJoin({
      gdacs: this.gdacsService.getEruptionData(),
    }).pipe(
      map((results) => {
        // Combine results from both sources
        const combinedData = [...results.gdacs];
        console.log(combinedData.length + 'éruptions trouvées.');

        this.eruptionEaterService.bulkRecord(combinedData);
        return combinedData;
      }),
    );
  }
}
