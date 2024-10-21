import { Injectable } from '@nestjs/common';
import { GdacsService } from '../Application/gdacs.service';
import { Hurricane } from '../Domain/Model/hurricane.model';
import { lastValueFrom } from 'rxjs';
import { HurricaneEaterService } from 'src/Application/hurricane_eater.service';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class HurricaneJob {
  constructor(
    private readonly gdacsService: GdacsService,
    private readonly hurricaneEaterService: HurricaneEaterService,
  ) {}

  //All 18 minutes
  @Cron('0 */18 * * * *')
  async getAllHurricaneData(): Promise<Hurricane[]> {
    console.log("Let's search some hurricanes");

    try {
      const [gdacsData] = await Promise.all([
        lastValueFrom(this.gdacsService.getHurricaneData()),
      ]);
      const combinedData = [...gdacsData];

      await this.hurricaneEaterService.bulkRecord(combinedData);

      console.log(combinedData.length + ' cyclones trouvés.');

      return combinedData;
    } catch (error) {
      console.error(
        'Erreur lors de la récupération des données des cyclones : ',
        error,
      );
      throw new Error('Failed to retrieve hurricane data');
    }
  }
}
