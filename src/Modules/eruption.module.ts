import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudWatchService } from 'src/Application/cloudwatch.service';
import { EruptionEaterService } from 'src/Application/eruption_eater.service';
import { GdacsService } from 'src/Application/gdacs.service';
import { SourceService } from 'src/Application/source.service';
import { EruptionController } from 'src/Controllers/eruption.controller';
import { Eruption } from 'src/Domain/Model/eruption.model';
import { Source } from 'src/Domain/Model/source.model';
import { EruptionSubscriber } from 'src/Infrastructure/Subscribers/eruption.subscriber';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([Source, Eruption])],
  controllers: [EruptionController],
  providers: [
    CloudWatchService,
    SourceService,
    GdacsService,
    EruptionEaterService,
    EruptionSubscriber,
  ],
})
export class EruptionModule {}
