import { Geometry } from 'geojson';
import { Disaster } from './disaster.model';
import { Column, Entity } from 'typeorm';

@Entity('floods')
export class Flood extends Disaster {
  niveau_alerte: number;
  @Column({ type: 'geometry' })
  surface: Geometry;
}
