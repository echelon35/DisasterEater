import { Controller, Get } from '@nestjs/common';
import { GdacsService } from '../Application/gdacs.service';
import { lastValueFrom } from 'rxjs';
import { CloudWatchService } from 'src/Application/cloudwatch.service';

@Controller('inondation')
export class InondationController {
  constructor(
    private readonly gdacsService: GdacsService,
    private readonly cloudWatchService: CloudWatchService,
  ) {}

  @Get('data')
  async getAllInondationData() {
    //GDACS
    const gdacsData = await lastValueFrom(
      this.gdacsService.getInondationData(),
    );
    const gdacsList = this.gdacsService.convertDataToInondation(gdacsData);

    // Combine
    const combinedData = {
      gdacs: gdacsList,
    };

    // Loguer les données ajoutées à la base dans CloudWatch
    // gdacsList.forEach(async (item) => {
    //   const logMessage = `Nouvel événement ajouté: Inondation à ${item.dernier_releve}}`;
    //   await this.cloudWatchService.logToCloudWatch(logMessage);
    // });

    return combinedData;
  }
}
