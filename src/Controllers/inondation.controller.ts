import { Controller, Get } from '@nestjs/common';
import { GdacsService } from '../Application/gdacs.service';
import { forkJoin, map, Observable } from 'rxjs';
import { CloudWatchService } from 'src/Application/cloudwatch.service';
import { Inondation } from 'src/Domain/Model/inondation.model';

@Controller('inondation')
export class InondationController {
  constructor(
    private readonly gdacsService: GdacsService,
    private readonly cloudWatchService: CloudWatchService,
  ) {}

  @Get('data')
  getAllInondationData(): Observable<Inondation[]> {
    return forkJoin({
      gdacs: this.gdacsService.getInondationData(),
    }).pipe(
      map((results) => {
        // Combine results from both sources
        const combinedData = [...results.gdacs];

        // Loguer les données ajoutées à la base dans CloudWatch
        combinedData.forEach(async (item) => {
          const logMessage = `Nouvel événement ajouté: Inondation à ${item.dernier_releve}}`;
          await this.cloudWatchService.logToCloudWatch(logMessage);
        });

        return combinedData;
      }),
    );
  }
}
