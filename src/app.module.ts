import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alea } from './Domain/Model/alea.model';
import { Earthquake } from './Domain/Model/earthquake.model';
import { Source } from './Domain/Model/source.model';
import { EarthquakeModule } from './Modules/earthquake/earthquake.module';
import { FloodModule } from './Modules/flood/flood.module';
import { Flood } from './Domain/Model/flood.model';
import { Hurricane } from './Domain/Model/hurricane.model';
import { HurricaneModule } from './Modules/hurricane.module';
import { Eruption } from './Domain/Model/eruption.model';
import { EruptionModule } from './Modules/eruption.module';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: './.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DISASTER_EATER_DB_HOST,
      port: parseInt(process.env.DISASTER_EATER_DB_PORT),
      username: process.env.DISASTER_EATER_DB_USER,
      password: process.env.DISASTER_EATER_DB_PASSWORD,
      database: process.env.DISASTER_EATER_DB_NAME,
      entities: [Alea, Earthquake, Source, Flood, Hurricane, Eruption],
      schema: 'public',
    }),
    ScheduleModule.forRoot(),
    EarthquakeModule,
    FloodModule,
    HurricaneModule,
    EruptionModule,
    HttpModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
