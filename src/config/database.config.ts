import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'mysql',

    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 3306),

    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,

    autoLoadEntities: true,

    synchronize: false,
    migrationsRun: false,

    logging:
      process.env.NODE_ENV === 'development'
        ? ['error', 'warn', 'migration']
        : ['error'],
  }),
);
