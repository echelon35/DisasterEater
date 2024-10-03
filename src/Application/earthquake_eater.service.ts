import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Earthquake } from 'src/Domain/Model/earthquake.model';
import { Repository } from 'typeorm';

@Injectable()
export class EarthquakeEaterService {
  constructor(
    @InjectRepository(Earthquake)
    private readonly earthquakeRepository: Repository<Earthquake>,
  ) {}

  async bulkRecord(earthquakes: Earthquake[]): Promise<Earthquake[]> {
    const saved = await this.earthquakeRepository.save(earthquakes);
    return saved;
  }
}
