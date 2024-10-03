import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudWatchService } from 'src/Application/cloudwatch.service';
import { EarthquakeEaterService } from 'src/Application/earthquake_eater.service';
import { GdacsService } from 'src/Application/gdacs.service';
import { SourceService } from 'src/Application/source.service';
import { UsgsService } from 'src/Application/usgs.service';
import { EarthquakeController } from 'src/Controllers/earthquake.controller';
import { Earthquake } from 'src/Domain/Model/earthquake.model';
import { Source } from 'src/Domain/Model/source.model';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([Source, Earthquake])],
  controllers: [EarthquakeController],
  providers: [
    UsgsService,
    CloudWatchService,
    SourceService,
    GdacsService,
    EarthquakeEaterService,
  ],
})
export class EarthquakeModule {}
