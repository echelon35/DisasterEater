import { Injectable } from '@nestjs/common';
import { Earthquake } from 'src/Domain/Model/earthquake.model';
import { DataSource } from 'typeorm';
import { CloudWatchService } from './cloudwatch.service';

@Injectable()
export class EarthquakeEaterService {
  constructor(
    private readonly cloudWatchService: CloudWatchService,
    private dataSource: DataSource,
  ) {}

  /**
   * Save earthquakes into db
   * @param earthquakes
   */
  async bulkRecord(earthquakes: Earthquake[]): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      //Check if earthquake already exists with the couple source and idFromSource
      await queryRunner.manager.upsert(Earthquake, earthquakes, [
        'idFromSource',
        'source',
      ]);
      await queryRunner.commitTransaction();
    } catch (err) {
      // since we have errors lets rollback the changes we made
      this.cloudWatchService.logToCloudWatch(
        'Earthquake',
        'An error occured during earthquakes record : ' + err.toString(),
      );
      await queryRunner.rollbackTransaction();
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await queryRunner.release();
    }
  }
}
