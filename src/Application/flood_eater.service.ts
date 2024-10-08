import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CloudWatchService } from './cloudwatch.service';
import { Flood } from 'src/Domain/Model/flood.model';

@Injectable()
export class FloodEaterService {
  constructor(
    private readonly cloudWatchService: CloudWatchService,
    private dataSource: DataSource,
  ) {}

  /**
   * Save floods into db
   * @param floods
   */
  async bulkRecord(floods: Flood[]): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.upsert(Flood, floods, {
        skipUpdateIfNoValuesChanged: true,
        conflictPaths: ['idFromSource', 'source'],
      });
      await queryRunner.commitTransaction();
    } catch (err) {
      // since we have errors lets rollback the changes we made
      this.cloudWatchService.logToCloudWatch(
        'Flood',
        'An error occured during floods record : ' + err.toString(),
      );
      await queryRunner.rollbackTransaction();
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await queryRunner.release();
    }
  }
}
