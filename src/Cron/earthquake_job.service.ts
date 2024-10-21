import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { lastValueFrom } from 'rxjs';
import { EarthquakeEaterService } from 'src/Application/earthquake_eater.service';
import { GdacsService } from 'src/Application/gdacs.service';
import { UsgsService } from 'src/Application/usgs.service';
import { Earthquake } from 'src/Domain/Model/earthquake.model';

@Injectable()
export class EarthquakeJob {
  constructor(
    private readonly gdacsService: GdacsService,
    private readonly usgsService: UsgsService,
    private readonly earthquakeEaterService: EarthquakeEaterService,
  ) {}

  //All 3 minutes
  @Cron('0 */3 * * * *')
  async getAllEarthquakeData(): Promise<Earthquake[]> {
    console.log("Let's search some earthquakes");

    try {
      const [gdacsData, usgsData] = await Promise.all([
        lastValueFrom(this.gdacsService.getEarthquakeData()),
        lastValueFrom(this.usgsService.getEarthquakeData()),
      ]);
      const combinedData = [...gdacsData, ...usgsData];

      await this.earthquakeEaterService.bulkRecord(combinedData);

      console.log(combinedData.length + ' séismes trouvés.');

      return combinedData;
    } catch (error) {
      console.error(
        'Erreur lors de la récupération des données des séismes : ',
        error,
      );
      throw new Error('Failed to retrieve earthquake data');
    }
  }
}
