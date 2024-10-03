import { Point } from 'geojson';
import { Column, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Source } from './source.model';

export class Disaster {
  @PrimaryGeneratedColumn()
  id: number;
  // alea: Alea;
  //Dates in UTC format
  @Column()
  premier_releve: Date;
  @Column()
  dernier_releve: Date;
  @Column({ type: 'geometry' })
  point: Point;
  @OneToOne((type) => Source, (source) => source.id)
  source: Source;
  @Column()
  idFromSource: string;
  @Column()
  lien_source: string;
  @Column({ default: 0 })
  nb_ressenti: number;
  @Column({ default: true })
  visible: boolean;
}
