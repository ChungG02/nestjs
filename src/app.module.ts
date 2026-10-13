import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import databaseConfig from './config/database.config';
import { envValidationSchema } from './config/env.validation';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,

      load: [databaseConfig],

      validationSchema: envValidationSchema,

      validationOptions: {
        abortEarly: false,
      },
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (configService: ConfigService): TypeOrmModuleOptions =>
        configService.getOrThrow<TypeOrmModuleOptions>('database'),
    }),

    UsersModule,
    AuthModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
