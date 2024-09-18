import { Geometry } from 'geojson';
import { Disaster } from './disaster.model';

export class Inondation extends Disaster {
  niveau_alerte: number;
  surface: Geometry;
}
