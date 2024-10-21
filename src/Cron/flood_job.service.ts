import { GdacsService } from '../Application/gdacs.service';
import { lastValueFrom } from 'rxjs';
import { Flood } from 'src/Domain/Model/flood.model';
import { FloodEaterService } from 'src/Application/flood_eater.service';
import { Cron } from '@nestjs/schedule';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FloodJob {
  constructor(
    private readonly gdacsService: GdacsService,
    private readonly floodEaterService: FloodEaterService,
  ) {}

  //All 13 minutes
  @Cron('0 */13 * * * *')
  async getAllInondationData(): Promise<Flood[]> {
    console.log("Let's search some floods");

    try {
      const [gdacsData] = await Promise.all([
        lastValueFrom(this.gdacsService.getFloodData()),
      ]);
      const combinedData = [...gdacsData];

      await this.floodEaterService.bulkRecord(combinedData);

      console.log(combinedData.length + ' inondations trouvées.');

      return combinedData;
    } catch (error) {
      console.error(
        'Erreur lors de la récupération des données des inondations : ',
        error,
      );
      throw new Error('Failed to retrieve flood data');
    }
  }
}
