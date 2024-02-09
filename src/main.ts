import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { PORT_NUMBER } from './common/constants';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.use(cookieParser());
  await app.listen(PORT_NUMBER);
}
bootstrap();
