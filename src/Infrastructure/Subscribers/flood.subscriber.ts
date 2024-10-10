import { Injectable } from '@nestjs/common';
import { CloudWatchService } from 'src/Application/cloudwatch.service';
import { NotifierService } from 'src/Application/notifier.service';
import { DisasterToSendToSQS } from 'src/DTO/DisasterToSendToSQS';
import { InsertType } from 'src/DTO/disasterDataFromSQS';
import { Flood } from 'src/Domain/Model/flood.model';
import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';

@Injectable()
@EventSubscriber()
export class FloodSubscriber implements EntitySubscriberInterface<Flood> {
  constructor(
    private readonly connection: Connection,
    private readonly cloudWatchService: CloudWatchService,
    private readonly notifierService: NotifierService,
  ) {
    connection.subscribers.push(this);
  }

  listenTo() {
    return Flood;
  }

  afterInsert(event: InsertEvent<Flood>) {
    if (event?.entity?.id !== undefined) {
      const flood = event?.entity;
      if (flood.createdAt < flood.updatedAt) {
        this.cloudWatchService.logToCloudWatch(
          'Flood',
          `Updated flood dated from ${flood.premier_releve}`,
        );
        //Send to queue
        this.notifierService.sendNotificationToSQS({
          type: InsertType.UPDATE,
          disaster_type: 'flood',
          disaster: new DisasterToSendToSQS(flood),
        });
      } else {
        this.cloudWatchService.logToCloudWatch(
          'Flood',
          `Created flood dated from ${flood.premier_releve}`,
        );
        this.notifierService.sendNotificationToSQS({
          type: InsertType.CREATION,
          disaster_type: 'flood',
          disaster: new DisasterToSendToSQS(flood),
        });
      }
    }
  }
}
