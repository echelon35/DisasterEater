import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudWatchService } from 'src/Application/cloudwatch.service';
import { GdacsService } from 'src/Application/gdacs.service';
import { SourceService } from 'src/Application/source.service';
import { EruptionController } from 'src/Controllers/eruption.controller';
import { Eruption } from 'src/Domain/Model/eruption.model';
import { Source } from 'src/Domain/Model/source.model';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([Source, Eruption])],
  controllers: [EruptionController],
  providers: [CloudWatchService, SourceService, GdacsService],
})
export class EruptionModule {}
