import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudWatchService } from 'src/Application/cloudwatch.service';
import { GdacsService } from 'src/Application/gdacs.service';
import { HurricaneEaterService } from 'src/Application/hurricane_eater.service';
import { NotifierService } from 'src/Application/notifier.service';
import { SourceService } from 'src/Application/source.service';
import { HurricaneController } from 'src/Controllers/hurricane.controller.';
import { HurricaneJob } from 'src/Cron/hurricane_job.service';
import { Hurricane } from 'src/Domain/Model/hurricane.model';
import { Source } from 'src/Domain/Model/source.model';
import { HurricaneSubscriber } from 'src/Infrastructure/Subscribers/hurricane.subscriber';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([Source, Hurricane])],
  controllers: [HurricaneController],
  providers: [
    CloudWatchService,
    SourceService,
    GdacsService,
    HurricaneJob,
    HurricaneEaterService,
    HurricaneSubscriber,
    NotifierService,
  ],
})
export class HurricaneModule {}
