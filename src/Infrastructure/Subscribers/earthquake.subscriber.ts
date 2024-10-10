import { Injectable } from '@nestjs/common';
import { CloudWatchService } from 'src/Application/cloudwatch.service';
import { NotifierService } from 'src/Application/notifier.service';
import { DisasterToSendToSQS } from 'src/DTO/DisasterToSendToSQS';
import { InsertType } from 'src/DTO/disasterDataFromSQS';
import { Earthquake } from 'src/Domain/Model/earthquake.model';
import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';

@Injectable()
@EventSubscriber()
export class EarthquakeSubscriber
  implements EntitySubscriberInterface<Earthquake>
{
  constructor(
    private readonly connection: Connection,
    private readonly cloudWatchService: CloudWatchService,
    private readonly notifierService: NotifierService,
  ) {
    connection.subscribers.push(this);
  }

  listenTo() {
    return Earthquake;
  }

  afterInsert(event: InsertEvent<Earthquake>) {
    if (event?.entity?.id !== undefined) {
      const earthquake = event?.entity;
      if (earthquake.createdAt < earthquake.updatedAt) {
        this.cloudWatchService.logToCloudWatch(
          'Earthquake',
          `Updated Earthquake M${earthquake.magnitude} dated from ${earthquake.premier_releve}`,
        );
        //Send to queue
        this.notifierService.sendNotificationToSQS({
          type: InsertType.UPDATE,
          disaster_type: 'earthquake',
          disaster: new DisasterToSendToSQS(earthquake),
        });
      } else {
        this.cloudWatchService.logToCloudWatch(
          'Earthquake',
          `Created Earthquake M${earthquake.magnitude} dated from ${earthquake.premier_releve}`,
        );
        this.notifierService.sendNotificationToSQS({
          type: InsertType.CREATION,
          disaster_type: 'earthquake',
          disaster: new DisasterToSendToSQS(earthquake),
        });
      }
    }
  }
}
