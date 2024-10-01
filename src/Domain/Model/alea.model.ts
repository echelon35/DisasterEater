import { Entity } from 'typeorm';

@Entity()
export class Alea {
  id: number;
  name: string;
  legend: string;
  disponible: boolean;
  keywords: string[];
}
