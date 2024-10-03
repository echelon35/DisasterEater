import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  console.log(
    'DisasterEater running on port ' + process.env.DISASTER_EATER_PORT,
  );
  await app.listen(process.env.DISASTER_EATER_PORT);
}
bootstrap();
