import { GdacsService } from '../Application/gdacs.service';
import { forkJoin, map, Observable } from 'rxjs';
import { Eruption } from 'src/Domain/Model/eruption.model';
import { EruptionEaterService } from 'src/Application/eruption_eater.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Controller, Get } from '@nestjs/common';

@Controller('eruption')
export class EruptionController {
  constructor(
    private readonly gdacsService: GdacsService,
    private readonly eruptionEaterService: EruptionEaterService,
  ) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  @Get('data')
  getAllEruptionData(): Observable<Eruption[]> {
    return forkJoin({
      gdacs: this.gdacsService.getEruptionData(),
    }).pipe(
      map((results) => {
        // Combine results from both sources
        const combinedData = [...results.gdacs];

        this.eruptionEaterService.bulkRecord(combinedData);
        return combinedData;
      }),
    );
  }
}
