import { GdacsService } from '../Application/gdacs.service';
import { lastValueFrom } from 'rxjs';
import { Eruption } from 'src/Domain/Model/eruption.model';
import { EruptionEaterService } from 'src/Application/eruption_eater.service';
import { Cron } from '@nestjs/schedule';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EruptionJob {
  constructor(
    private readonly gdacsService: GdacsService,
    private readonly eruptionEaterService: EruptionEaterService,
  ) {}

  //All 15 minutes
  @Cron('0 */15 * * * *')
  async getAllEruptionData(): Promise<Eruption[]> {
    console.log("Let's search some eruptions");

    try {
      const [gdacsData] = await Promise.all([
        lastValueFrom(this.gdacsService.getEruptionData()),
      ]);
      const combinedData = [...gdacsData];

      await this.eruptionEaterService.bulkRecord(combinedData);

      console.log(combinedData.length + ' éruptions volcaniques trouvées.');

      return combinedData;
    } catch (error) {
      console.error(
        'Erreur lors de la récupération des données des éruptions : ',
        error,
      );
      throw new Error('Failed to retrieve eruption data');
    }
  }
}
