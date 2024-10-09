import { CloudWatchService } from 'src/Application/cloudwatch.service';
import { NotifierService } from 'src/Application/notifier.service';
import { InsertType } from 'src/DTO/disasterDataFromSQS';
import { Hurricane } from 'src/Domain/Model/hurricane.model';
import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';

@EventSubscriber()
export class HurricaneSubscriber
  implements EntitySubscriberInterface<Hurricane>
{
  constructor(
    private readonly connection: Connection,
    private readonly cloudWatchService: CloudWatchService,
    private readonly notifierService: NotifierService,
  ) {
    connection.subscribers.push(this);
  }

  listenTo() {
    return Hurricane;
  }

  afterInsert(event: InsertEvent<Hurricane>) {
    if (event?.entity?.id !== undefined) {
      const hurricane = event?.entity;
      if (hurricane.createdAt < hurricane.updatedAt) {
        this.cloudWatchService.logToCloudWatch(
          'Hurricane',
          `Updated hurricane ${hurricane.name}`,
        );
        this.notifierService.sendNotificationToSQS({
          type: InsertType.UPDATE,
          disaster_type: 'hurricane',
          disaster: hurricane,
        });
      } else {
        this.cloudWatchService.logToCloudWatch(
          'Hurricane',
          `Created hurricane ${hurricane.name}`,
        );
        this.notifierService.sendNotificationToSQS({
          type: InsertType.CREATION,
          disaster_type: 'hurricane',
          disaster: hurricane,
        });
      }
    }
  }
}
