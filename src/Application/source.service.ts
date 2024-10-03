import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Source } from '../Domain/Model/source.model';
import { Repository } from 'typeorm';

@Injectable()
export class SourceService {
  constructor(
    @InjectRepository(Source)
    private readonly sourceRepository: Repository<Source>,
  ) {}

  findOneByName(name: string): Promise<Source> {
    return this.sourceRepository.findOneBy({ name: name });
  }
}
