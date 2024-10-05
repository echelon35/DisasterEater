import { CloudWatchService } from 'src/Application/cloudwatch.service';
import { Earthquake } from 'src/Domain/Model/earthquake.model';
import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';

@EventSubscriber()
export class EarthquakeSubscriber
  implements EntitySubscriberInterface<Earthquake>
{
  constructor(private readonly cloudWatchService: CloudWatchService) {}

  listenTo() {
    // This allows us listen to a specific entity (table)
    return Earthquake;
  }

  afterInsert(event: InsertEvent<Earthquake>) {
    const earthquake = event?.entity;
    console.log(
      `Created Earthquake M${earthquake.magnitude} dated from ${earthquake.premier_releve}`,
    );
    // this.cloudWatchService.logToCloudWatch(
    //   'Earthquake',
    //   `Created Earthquake M${earthquake.magnitude} dated from ${earthquake.premier_releve}`,
    // );
  }
  afterUpdate(event: UpdateEvent<Earthquake>) {
    const earthquake = event?.entity;
    console.log(
      `Updated Earthquake M${earthquake.magnitude} dated from ${earthquake.premier_releve}`,
    );
    // this.cloudWatchService.logToCloudWatch(
    //   'Earthquake',
    //   `Updated Earthquake M${earthquake.magnitude} dated from ${earthquake.premier_releve}`,
    // );
  }
}
