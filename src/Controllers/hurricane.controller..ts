import { Controller, Get } from '@nestjs/common';
import { GdacsService } from '../Application/gdacs.service';
import { Hurricane } from '../Domain/Model/hurricane.model';
import { Observable, forkJoin, map } from 'rxjs';
import { HurricaneEaterService } from 'src/Application/hurricane_eater.service';

@Controller('hurricane')
export class HurricaneController {
  constructor(
    private readonly gdacsService: GdacsService,
    private readonly hurricaneEaterService: HurricaneEaterService,
  ) {}

  @Get('data')
  getAllHurricaneData(): Observable<Hurricane[]> {
    return forkJoin({
      gdacs: this.gdacsService.getHurricaneData(),
    }).pipe(
      map((results) => {
        // Combine results from both sources
        const combinedData = [...results.gdacs];

        this.hurricaneEaterService.bulkRecord(combinedData);

        return combinedData;
      }),
    );
  }
}
