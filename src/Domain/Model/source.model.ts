import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('sources')
export class Source {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column()
  adress: string;
}
