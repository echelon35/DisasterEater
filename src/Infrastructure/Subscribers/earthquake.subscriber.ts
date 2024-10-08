import { Injectable } from '@nestjs/common';
import { CloudWatchService } from 'src/Application/cloudwatch.service';
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
      } else {
        this.cloudWatchService.logToCloudWatch(
          'Earthquake',
          `Created Earthquake M${earthquake.magnitude} dated from ${earthquake.premier_releve}`,
        );
      }
    }
  }
}
