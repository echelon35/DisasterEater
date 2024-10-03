import { Controller, Get } from '@nestjs/common';
import { GdacsService } from '../Application/gdacs.service';
import { forkJoin, map, Observable } from 'rxjs';
import { Flood } from 'src/Domain/Model/flood.model';
import { FloodEaterService } from 'src/Application/flood_eater.service';

@Controller('flood')
export class FloodController {
  constructor(
    private readonly gdacsService: GdacsService,
    private readonly floodEaterService: FloodEaterService,
  ) {}

  @Get('data')
  getAllInondationData(): Observable<Flood[]> {
    return forkJoin({
      gdacs: this.gdacsService.getFloodData(),
    }).pipe(
      map((results) => {
        // Combine results from both sources
        const combinedData = [...results.gdacs];

        this.floodEaterService.bulkRecord(combinedData);

        return combinedData;
      }),
    );
  }
}
