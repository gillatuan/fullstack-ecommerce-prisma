import { AuthModule } from '@/auth/auth.module';
import { CommentsModule } from '@/comments/comments.module';
import { PostsModule } from '@/posts/posts.module';
import { UsersModule } from '@/users/users.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { LoggerModule } from 'nestjs-pino';
import { join } from 'path';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { APP_FILTER } from "@nestjs/core";
import { GlobalExceptionFilter } from "exception-filters/global-exception.filter";

@Module({
  imports: [
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get('NODE_ENV') === 'production';

        return {
          pinoHttp: {
            transport: isProduction
              ? undefined
              : {
                  target: 'pino-pretty',
                  options: {
                    singleLine: true,
                  },
                },
            level: isProduction ? 'info' : 'debug',
          },
        };
      },
      inject: [ConfigService],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    ConfigModule.forRoot(),
    UsersModule,
    AuthModule,
    PostsModule,
    CommentsModule,
    RolesModule,
    PermissionsModule,
  ],
  controllers: [],
  providers: [{
    provide: APP_FILTER,
    useClass: GlobalExceptionFilter
  }],
})
export class AppModule {}
