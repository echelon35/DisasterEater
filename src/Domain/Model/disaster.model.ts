import { Point } from 'geojson';
import { Ville } from './ville.model';
import { Source } from './source.model';
import { Alea } from './alea.model';

export class Disaster {
  alea: Alea;
  //Dates in UTC format
  premier_releve: Date;
  dernier_releve: Date;
  point: Point;
  sourceId: string;
  source: Source;
  idSource: string;
  lien_source: string;
  nb_ressenti: number;
  visible: boolean;
  distance_ville: number;
  villeId: number;
  ville: Ville;
}
