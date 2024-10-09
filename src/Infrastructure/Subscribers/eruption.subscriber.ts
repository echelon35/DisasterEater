import { Injectable } from '@nestjs/common';
import { CloudWatchService } from 'src/Application/cloudwatch.service';
import { NotifierService } from 'src/Application/notifier.service';
import { InsertType } from 'src/DTO/disasterDataFromSQS';
import { Eruption } from 'src/Domain/Model/eruption.model';
import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';

@Injectable()
@EventSubscriber()
export class EruptionSubscriber implements EntitySubscriberInterface<Eruption> {
  constructor(
    private readonly connection: Connection,
    private readonly cloudWatchService: CloudWatchService,
    private readonly notifierService: NotifierService,
  ) {
    connection.subscribers.push(this);
  }

  listenTo() {
    return Eruption;
  }

  afterInsert(event: InsertEvent<Eruption>) {
    if (event?.entity?.id !== undefined) {
      const eruption = event?.entity;
      if (eruption.createdAt < eruption.updatedAt) {
        this.cloudWatchService.logToCloudWatch(
          'Eruption',
          `Updated eruption of ${eruption.name} dated from ${eruption.name}`,
        );
        this.notifierService.sendNotificationToSQS({
          type: InsertType.UPDATE,
          disaster_type: 'eruption',
          disaster: eruption,
        });
      } else {
        this.cloudWatchService.logToCloudWatch(
          'Earthquake',
          `Created eruption of ${eruption.name} dated from ${eruption.name}`,
        );
        this.notifierService.sendNotificationToSQS({
          type: InsertType.CREATION,
          disaster_type: 'eruption',
          disaster: eruption,
        });
      }
    }
  }
}
