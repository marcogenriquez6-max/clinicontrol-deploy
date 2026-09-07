import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';

config();

const isProduction = process.env.NODE_ENV === 'production';
const isPostgres = process.env.DB_TYPE === 'postgres';

let options: DataSourceOptions;

if (isPostgres) {
  options = {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'hospital_db',
    synchronize:
      !isProduction && String(process.env.DB_SYNC ?? 'true') === 'true',
    logging: process.env.DB_LOGGING === 'true',
    entities: [path.join(__dirname, '..', 'entities', '*.entity.{ts,js}')],
    migrations: [path.join(__dirname, 'migrations', '*.{ts,js}')],
    migrationsRun: isProduction,
    migrationsTableName: 'migrations_history',
    dropSchema: false,
    poolSize: Number(process.env.DB_POOL_SIZE) || 20,
    extra: {
      max: Number(process.env.DB_POOL_SIZE) || 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    },
  } as DataSourceOptions;
} else {
  options = {
    type: 'sqlite',
    database: process.env.DB_PATH || 'data/hospital.db',
    synchronize:
      !isProduction && String(process.env.DB_SYNC ?? 'true') === 'true',
    logging: process.env.DB_LOGGING === 'true',
    entities: [path.join(__dirname, '..', 'entities', '*.entity.{ts,js}')],
    migrations: [path.join(__dirname, 'migrations', '*.{ts,js}')],
    migrationsRun: isProduction,
    migrationsTableName: 'migrations_history',
    dropSchema: false,
  } as DataSourceOptions;
}

export const AppDataSource = new DataSource(options);
