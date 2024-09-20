import { Controller, Get } from '@nestjs/common';
import { GdacsService } from '../Application/gdacs.service';
import { CloudWatchService } from 'src/Application/cloudwatch.service';
import { forkJoin, map, Observable } from 'rxjs';
import { Eruption } from 'src/Domain/Model/eruption.model';

@Controller('eruption')
export class EruptionController {
  constructor(
    private readonly gdacsService: GdacsService,
    private readonly cloudWatchService: CloudWatchService,
  ) {}

  @Get('data')
  getAllEruptionData(): Observable<Eruption[]> {
    return forkJoin({
      gdacs: this.gdacsService.getEruptionData(),
    }).pipe(
      map((results) => {
        // Combine results from both sources
        const combinedData = [...results.gdacs];

        // Loguer les données ajoutées à la base dans CloudWatch
        combinedData.forEach(async (item) => {
          const logMessage = `Nouvel événement ajouté: Eruption ${item.nom} à ${item.dernier_releve}}`;
          await this.cloudWatchService.logToCloudWatch(logMessage);
        });

        return combinedData;
      }),
    );
  }
}
