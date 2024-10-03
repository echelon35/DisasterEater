import { Geometry } from 'geojson';
import { Disaster } from './disaster.model';
import { Column, Entity } from 'typeorm';

@Entity('hurricanes')
export class Hurricane extends Disaster {
  @Column()
  name: string;
  vitesse_max: number;
  @Column({ type: 'geometry', nullable: true })
  path: Geometry;
  @Column({ type: 'geometry', nullable: true })
  surface: Geometry;
  @Column({ type: 'geometry', nullable: true })
  forecast: Geometry;
}
