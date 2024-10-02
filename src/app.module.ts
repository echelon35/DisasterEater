import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GdacsService } from './Application/gdacs.service';
import { UsgsService } from './Application/usgs.service';
import { EarthquakeController } from './Controllers/earthquake.controller';
import { HttpModule } from '@nestjs/axios';
import { CloudWatchService } from './Application/cloudwatch.service';
import { ConfigModule } from '@nestjs/config';
import { InondationController } from './Controllers/inondation.controller';
import { EruptionController } from './Controllers/eruption.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DISASTER_EATER_DB_HOST,
      port: parseInt(process.env.DISASTER_EATER_DB_PORT),
      username: process.env.DISASTER_EATER_DB_USER,
      password: process.env.DISASTER_EATER_DB_PASSWORD,
      database: process.env.DISASTER_EATER_DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
    }),
    ConfigModule.forRoot({
      envFilePath: './.env',
      isGlobal: true,
    }),
  ],
  controllers: [
    AppController,
    EarthquakeController,
    InondationController,
    EruptionController,
  ],
  providers: [AppService, GdacsService, UsgsService, CloudWatchService],
})
export class AppModule {}
