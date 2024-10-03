import { Column, Entity } from 'typeorm';
import { Disaster } from './disaster.model';

@Entity('earthquakes')
export class Earthquake extends Disaster {
  /** Global */
  // premier_releve: Date;
  // dernier_releve: Date;
  // point: Point;
  // sourceId: string;
  // source: Source[];
  // idSource: string;
  // lien_source: string;
  // nb_ressenti: number;
  // visible: boolean;
  // distance_ville: number;
  // villeId: number;
  // ville: Ville;
  /** Specific */
  nb_stations: number;
  @Column()
  magnitude: number;
  precision: number;
  type_magnitude: string;
  profondeur_epicentre: number;
  tsunami: boolean;
  intensite: number;
  nb_ressenti: number;
}
