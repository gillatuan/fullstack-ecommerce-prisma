import { AuthModule } from '@/auth/auth.module';
import { CommentsModule } from '@/comments/comments.module';
import { PostsModule } from '@/posts/posts.module';
import { UsersModule } from '@/users/users.module';
import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { exec } from 'child_process';
import { GlobalExceptionFilter } from 'exception-filters/global-exception.filter';
import { LoggerModule } from 'nestjs-pino';
import { join } from 'path';
import { PermissionsGuard } from 'rbac/permission.guard';
import { PermissionsModule } from './permissions/permissions.module';
import { RolesModule } from './roles/roles.module';

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
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})
export class AppModule implements OnModuleInit {
  async onModuleInit() {
    if (process.env.NODE_ENV !== 'production') {
      exec('npx prisma db seed', (err) => {
        if (err) console.error('Seed error', err);
      });
    }
  }
}
