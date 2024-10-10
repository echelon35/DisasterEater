import { Point } from 'geojson';
import { Disaster } from 'src/Domain/Model/disaster.model';
import { Source } from 'src/Domain/Model/source.model';

/**
 * Only send to SQS the required properties
 */
export class DisasterToSendToSQS {
  id: number;
  premier_releve: Date;
  dernier_releve: Date;
  point: Point;
  source: Source;
  idFromSource: string;
  lien_source: string;
  nb_ressenti: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(disaster: Disaster) {
    this.id = disaster.id;
    this.premier_releve = disaster.premier_releve;
    this.dernier_releve = disaster.dernier_releve;
    this.point = disaster.point;
    this.source = disaster.source;
    this.idFromSource = disaster.idFromSource;
    this.lien_source = disaster.lien_source;
    this.nb_ressenti = disaster.nb_ressenti;
    this.createdAt = disaster.createdAt;
    this.updatedAt = disaster.updatedAt;
  }
}
