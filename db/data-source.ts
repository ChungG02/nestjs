import 'dotenv/config';

import { join } from 'node:path';
import { DataSource, DataSourceOptions } from 'typeorm';

const getRequiredEnvironmentVariable = (name: string): string => {
  const value = process.env[name];

  if (value === undefined || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

const databasePort = Number(process.env.DB_PORT ?? 3306);

if (!Number.isInteger(databasePort) || databasePort <= 0) {
  throw new Error('DB_PORT must be a valid positive integer');
}

export const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',

  host: getRequiredEnvironmentVariable('DB_HOST'),
  port: databasePort,

  username: getRequiredEnvironmentVariable('DB_USERNAME'),
  password: process.env.DB_PASSWORD ?? '',
  database: getRequiredEnvironmentVariable('DB_DATABASE'),

  entities: [
    join(process.cwd(), 'src', '**', '*.entity{.ts,.js}'),
  ],

  migrations: [
    join(process.cwd(), 'db', 'migrations', '*{.ts,.js}'),
  ],

  synchronize: false,
  migrationsRun: false,

  logging:
    process.env.NODE_ENV === 'development'
      ? ['error', 'warn', 'migration']
      : ['error'],
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;