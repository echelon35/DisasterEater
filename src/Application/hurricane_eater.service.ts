import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CloudWatchService } from './cloudwatch.service';
import { Hurricane } from 'src/Domain/Model/hurricane.model';

@Injectable()
export class HurricaneEaterService {
  constructor(
    private readonly cloudWatchService: CloudWatchService,
    private dataSource: DataSource,
  ) {}

  /**
   * Save hurricanes into db
   * @param hurricanes
   */
  async bulkRecord(hurricanes: Hurricane[]): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      //Check if hurricane already exists with the couple source and idFromSource
      await queryRunner.manager.upsert(Hurricane, hurricanes, {
        skipUpdateIfNoValuesChanged: true,
        conflictPaths: ['idFromSource', 'source'],
      });
      await queryRunner.commitTransaction();
    } catch (err) {
      // since we have errors lets rollback the changes we made
      this.cloudWatchService.logToCloudWatch(
        'Hurricane',
        'An error occured during hurricanes record : ' + err.toString(),
      );
      await queryRunner.rollbackTransaction();
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await queryRunner.release();
    }
  }
}
