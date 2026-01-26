import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(app.get(Logger));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.use(cookieParser());

  // set prefix
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'api/v',
  });

  await app.listen(app.get(ConfigService).getOrThrow('PORT') ?? 3001);
}
bootstrap();
