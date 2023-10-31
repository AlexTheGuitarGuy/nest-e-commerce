import { DataSource, DataSourceOptions } from 'typeorm';

export const datasourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env['PG_HOST'] || 'localhost',
  port: +(process.env['PG_PORT'] || 5432),
  username: process.env['PG_USERNAME'] || 'postgres',
  password: process.env['PG_PASSWORD'] || 'postgres',
  database: process.env['PG_DATABASE'] || 'postgres',
  synchronize: true,
  logging: true,
  entities: [`${__dirname}/entities/*.entity{.ts,.js}`],
  migrations: [`${__dirname}/migrations/*{.ts,.js}`],
  migrationsTableName: 'migrations',
};

export default new DataSource(datasourceOptions);
