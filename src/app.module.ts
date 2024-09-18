import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GdacsService } from './Application/gdacs.service';
import { UsgsService } from './Application/usgs.service';
import { SeismeController } from './Controllers/seisme.controller';
import { HttpModule } from '@nestjs/axios';
import { CloudWatchService } from './Application/cloudwatch.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      envFilePath: './.env',
      isGlobal: true,
    }),
  ],
  controllers: [AppController, SeismeController],
  providers: [AppService, GdacsService, UsgsService, CloudWatchService],
})
export class AppModule {}
