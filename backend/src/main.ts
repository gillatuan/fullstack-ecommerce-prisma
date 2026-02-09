import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { Logger } from 'nestjs-pino';
import { PermissionGuard } from 'rbac/permission.guard';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(app.get(Logger));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // include PermissionGuard
  // app.useGlobalGuards(new PermissionGuard(app.get(Reflector)));

  app.use(cookieParser());

  // set prefix
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'api/v',
    defaultVersion: '1',
  });

  await app.listen(app.get(ConfigService).getOrThrow('PORT') ?? 3001);
}
bootstrap();
