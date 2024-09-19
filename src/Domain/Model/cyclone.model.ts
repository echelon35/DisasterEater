import { Geometry } from 'geojson';
import { Disaster } from './disaster.model';

export class Cyclone extends Disaster {
  nom: string;
  vitesse_max: number;
  trajectoire: Geometry;
  surface: Geometry;
  prevision: Geometry;
}
