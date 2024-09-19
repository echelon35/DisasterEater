import { Controller, Get } from '@nestjs/common';
import { GdacsService } from '../Application/gdacs.service';
import { lastValueFrom } from 'rxjs';
import { CloudWatchService } from 'src/Application/cloudwatch.service';

@Controller('eruption')
export class EruptionController {
  constructor(
    private readonly gdacsService: GdacsService,
    private readonly cloudWatchService: CloudWatchService,
  ) {}

  @Get('data')
  async getAllEruptionData() {
    //GDACS
    const gdacsData = await lastValueFrom(this.gdacsService.getEruptionData());
    const gdacsList = this.gdacsService.convertDataToEruption(gdacsData);

    // Combine
    const combinedData = {
      gdacs: gdacsList,
    };

    // Loguer les données ajoutées à la base dans CloudWatch
    gdacsList.forEach(async (item) => {
      const logMessage = `Nouvel événement ajouté: Eruption ${item.nom} à ${item.dernier_releve}}`;
      await this.cloudWatchService.logToCloudWatch(logMessage);
    });

    return combinedData;
  }
}
