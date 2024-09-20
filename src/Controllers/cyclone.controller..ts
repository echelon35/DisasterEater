import { Controller, Get } from '@nestjs/common';
import { GdacsService } from '../Application/gdacs.service';
import { lastValueFrom } from 'rxjs';
import { CloudWatchService } from 'src/Application/cloudwatch.service';

@Controller('cyclone')
export class CycloneController {
  constructor(
    private readonly gdacsService: GdacsService,
    private readonly cloudWatchService: CloudWatchService,
  ) {}

  @Get('data')
  async getAllCycloneData() {
    //GDACS
    const gdacsData = await lastValueFrom(this.gdacsService.getCycloneData());
    const gdacsList = this.gdacsService.convertDataToEruption(gdacsData);

    // Combine
    const combinedData = {
      gdacs: gdacsList,
    };

    // Loguer les données ajoutées à la base dans CloudWatch
    gdacsList.forEach(async (item) => {
      const logMessage = `Nouvel événement ajouté: Cyclone ${item.nom} à ${item.dernier_releve}}`;
      await this.cloudWatchService.logToCloudWatch(logMessage);
    });

    return combinedData;
  }
}
