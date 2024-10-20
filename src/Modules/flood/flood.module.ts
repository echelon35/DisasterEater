import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudWatchService } from 'src/Application/cloudwatch.service';
import { FloodEaterService } from 'src/Application/flood_eater.service';
import { GdacsService } from 'src/Application/gdacs.service';
import { NotifierService } from 'src/Application/notifier.service';
import { SourceService } from 'src/Application/source.service';
import { FloodController } from 'src/Controllers/flood.controller';
import { FloodJob } from 'src/Cron/flood_job.service';
import { Flood } from 'src/Domain/Model/flood.model';
import { Source } from 'src/Domain/Model/source.model';
import { FloodSubscriber } from 'src/Infrastructure/Subscribers/flood.subscriber';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([Source, Flood])],
  controllers: [FloodController],
  providers: [
    CloudWatchService,
    SourceService,
    GdacsService,
    FloodEaterService,
    FloodSubscriber,
    FloodJob,
    NotifierService,
  ],
})
export class FloodModule {}
