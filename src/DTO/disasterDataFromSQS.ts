import { DisasterToSendToSQS } from './DisasterToSendToSQS';

export enum InsertType {
  CREATION = 'create',
  UPDATE = 'update',
}

export class DisasterDataFromSQS {
  type: InsertType;
  disaster_type: string;
  disaster: DisasterToSendToSQS;
}
