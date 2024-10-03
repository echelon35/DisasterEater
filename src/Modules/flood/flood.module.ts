import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudWatchService } from 'src/Application/cloudwatch.service';
import { GdacsService } from 'src/Application/gdacs.service';
import { SourceService } from 'src/Application/source.service';
import { InondationController } from 'src/Controllers/inondation.controller';
import { Inondation } from 'src/Domain/Model/inondation.model';
import { Source } from 'src/Domain/Model/source.model';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([Source, Inondation])],
  controllers: [InondationController],
  providers: [CloudWatchService, SourceService, GdacsService],
})
export class FloodModule {}
