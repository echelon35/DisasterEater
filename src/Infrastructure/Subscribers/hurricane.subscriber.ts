import { CloudWatchService } from 'src/Application/cloudwatch.service';
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
      } else {
        this.cloudWatchService.logToCloudWatch(
          'Hurricane',
          `Created hurricane ${hurricane.name}`,
        );
      }
    }
  }
}
