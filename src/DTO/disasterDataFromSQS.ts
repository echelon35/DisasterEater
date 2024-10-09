import { Disaster } from 'src/Domain/Model/disaster.model';

export enum InsertType {
  CREATION = 'create',
  UPDATE = 'update',
}

export class DisasterDataFromSQS {
  type: InsertType;
  disaster_type: string;
  disaster: Disaster;
}
