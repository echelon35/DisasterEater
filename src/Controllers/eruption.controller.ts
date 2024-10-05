import { Controller, Get } from '@nestjs/common';
import { GdacsService } from '../Application/gdacs.service';
import { forkJoin, map, Observable } from 'rxjs';
import { Eruption } from 'src/Domain/Model/eruption.model';
import { EruptionEaterService } from 'src/Application/eruption_eater.service';

@Controller('eruption')
export class EruptionController {
  constructor(
    private readonly gdacsService: GdacsService,
    private readonly eruptionEaterService: EruptionEaterService,
  ) {}

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
