import { Geometry } from 'geojson';
import { Disaster } from './disaster.model';
import { Column, Entity } from 'typeorm';

@Entity('eruptions')
export class Eruption extends Disaster {
  @Column()
  name: string;
  @Column({ type: 'geometry' })
  surface: Geometry;
}
