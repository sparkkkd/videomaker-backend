import { Module } from '@nestjs/common'
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'

import appConfig from './config/config'
import { AllExceptionsFilter } from './common/filters/http-exception.filter'

import { LoggingInterceptor } from './common/interceptors/logging.interceptor'

import { PrismaModule } from './database/prisma.module'
import { TabsModule } from './tabs/tabs.module'
import { ProjectsModule } from './projects/projects.module'
import { UploadsModule } from './uploads/uploads.module'
import { HealthModule } from './health/health.module'
import { AuthModule } from './auth/auth.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      envFilePath: '.env',
    }),

    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            name: 'short',
            ttl: 1000,
            limit: config.get('app.nodeEnv') === 'production' ? 3 : 100,
          },
        ],
      }),
    }),

    PrismaModule,
    AuthModule,
    TabsModule,
    ProjectsModule,
    UploadsModule,
    HealthModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
