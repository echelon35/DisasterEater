import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'aleas' })
export class Alea {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column()
  legend: string;
  @Column({ default: true })
  disponible: boolean;
  @Column({ type: 'json' })
  keywords: string[];
}
