import { Disaster } from './disaster.model';

export class Seisme extends Disaster {
  nb_stations: number;
  magnitude: number;
  precision: number;
  type_magnitude: string;
  profondeur_epicentre: number;
  tsunami: boolean;
  intensite: number;
  nb_ressenti: number;
}
