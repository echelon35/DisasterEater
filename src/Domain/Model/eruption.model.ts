import { Geometry } from 'geojson';
import { Disaster } from './disaster.model';

export class Eruption extends Disaster {
  nom: string;
  surface: Geometry;
}
