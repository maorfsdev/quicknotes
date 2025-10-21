import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { NotesModule } from './notes/notes.module';
import { HealthModule } from './health/health.module';
import { MetricsModule } from './metrics/metrics.module';
import { CacheModule as CustomCacheModule } from './cache/cache.module';
import { DatabaseConfigService } from './database/database-config.service';
import { ConfigValidationSchema } from './config/config-validation.schema';
import { UpstreamHeaderMiddleware } from './middleware/upstream-header.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: ConfigValidationSchema,
    }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfigService,
    }),
    CacheModule.register({
      isGlobal: true,
      store: 'memory',
      ttl: 60000, // 60 seconds
    }),
    AuthModule,
    UsersModule,
    NotesModule,
    HealthModule,
    MetricsModule,
    CustomCacheModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UpstreamHeaderMiddleware)
      .forRoutes('*');
  }
}
