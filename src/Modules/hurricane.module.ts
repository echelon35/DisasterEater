import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudWatchService } from 'src/Application/cloudwatch.service';
import { GdacsService } from 'src/Application/gdacs.service';
import { HurricaneEaterService } from 'src/Application/hurricane_eater.service';
import { SourceService } from 'src/Application/source.service';
import { HurricaneController } from 'src/Controllers/hurricane.controller.';
import { Hurricane } from 'src/Domain/Model/hurricane.model';
import { Source } from 'src/Domain/Model/source.model';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([Source, Hurricane])],
  controllers: [HurricaneController],
  providers: [
    CloudWatchService,
    SourceService,
    GdacsService,
    HurricaneEaterService,
  ],
})
export class HurricaneModule {}
