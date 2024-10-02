import { Controller, Get } from '@nestjs/common';
import { GdacsService } from '../Application/gdacs.service';
import { UsgsService } from '../Application/usgs.service';
import { lastValueFrom } from 'rxjs';
import { CloudWatchService } from 'src/Application/cloudwatch.service';

@Controller('earthquake')
export class EarthquakeController {
  constructor(
    private readonly gdacsService: GdacsService,
    private readonly usgsService: UsgsService,
    private readonly cloudWatchService: CloudWatchService,
  ) {}

  @Get('data')
  async getAllSeismeData() {
    // USGS
    const usgsData = await lastValueFrom(this.usgsService.getEarthquakeData());
    const usgsList = this.usgsService.convertDataToSeisme(usgsData);

    //GDACS
    const gdacsData = await lastValueFrom(
      this.gdacsService.getEarthquakeData(),
    );
    const gdacsList = this.gdacsService.convertDataToSeisme(gdacsData);

    const sameSeismes = gdacsList.filter((a) =>
      usgsList.some(
        (b) =>
          a.point?.coordinates[0] === b.point?.coordinates[0] &&
          a.point?.coordinates[1] === b.point?.coordinates[1] &&
          a.dernier_releve.toISOString() === b.dernier_releve.toISOString(),
      ),
    );

    // Combine
    const combinedData = {
      gdacs: gdacsList,
      usgs: usgsList,
      common: sameSeismes,
    };

    // Loguer les données ajoutées à la base dans CloudWatch
    gdacsList.forEach(async (item) => {
      const logMessage = `Nouvel événement ajouté: Seisme M${item.magnitude} à ${item.dernier_releve}}`;
      await this.cloudWatchService.logToCloudWatch(logMessage);
    });

    return combinedData;
  }
}
