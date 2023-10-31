import { DataSource, DataSourceOptions } from 'typeorm';

export const datasourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env['PG_HOST'] || 'localhost',
  port: +(process.env['PG_PORT'] || 5432),
  username: process.env['PG_USERNAME'] || 'postgres',
  password: process.env['PG_PASSWORD'] || 'postgres',
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/migrations/*.js'],
  database: process.env['PG_DATABASE'] || 'postgres',
  synchronize: true,
  logging: true,
  migrationsTableName: 'migrations',
};

export default new DataSource(datasourceOptions);
