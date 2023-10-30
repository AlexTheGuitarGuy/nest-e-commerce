import { registerAs } from '@nestjs/config';
import { config as dotenvConfig } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

dotenvConfig({ path: '.env' });

const config: DataSourceOptions = {
  type: 'postgres',
  host: process.env['PG_HOST'] || 'localhost',
  port: +(process.env['PG_PORT'] || 5432),
  username: process.env['PG_USERNAME'] || 'postgres',
  password: process.env['PG_PASSWORD'] || 'postgres',
  entities: ['dist/**/*.entity.js'],
  database: process.env['PG_DATABASE'] || 'postgres',
  synchronize: true,
  migrations: ['src/migrations/**/*.{ts,js}'],
};

export default registerAs('postgres', () => config);
export const connectionSource = new DataSource(config);
