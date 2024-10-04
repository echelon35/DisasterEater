import { DataSource } from 'typeorm';
import { CloudWatchService } from './cloudwatch.service';
import { Injectable } from '@nestjs/common';
import { Eruption } from 'src/Domain/Model/eruption.model';

@Injectable()
export class EruptionEaterService {
  constructor(
    private readonly cloudWatchService: CloudWatchService,
    private dataSource: DataSource,
  ) {}

  /**
   * Save eruptions into db
   * @param eruptions
   */
  async bulkRecord(eruptions: Eruption[]): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      //Check if earthquake already exists with the couple source and idFromSource
      await queryRunner.manager.upsert(Eruption, eruptions, [
        'idFromSource',
        'source',
      ]);
      await queryRunner.commitTransaction().then(
        () => {
          eruptions.forEach((item) => {
            this.cloudWatchService.logToCloudWatch(
              'Eruption',
              `Eruption of ${item.name} volcano added or updated`,
            );
          });
        },
        (err) => {
          this.cloudWatchService.logToCloudWatch(
            'Eruption',
            'An error occured during eruptions record : ' + err.toString(),
          );
        },
      );
    } catch (err) {
      // since we have errors lets rollback the changes we made
      this.cloudWatchService.logToCloudWatch(
        'Eruption',
        'An error occured during eruptions record : ' + err.toString(),
      );
      await queryRunner.rollbackTransaction();
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await queryRunner.release();
    }
  }
}
