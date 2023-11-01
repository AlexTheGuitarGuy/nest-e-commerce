import { environment } from 'src/environments/environment';
import { DataSource, DataSourceOptions } from 'typeorm';

export const datasourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: environment.PG_HOST || 'localhost',
  port: +(environment.PG_PORT || 5432),
  username: environment.PG_USERNAME || 'postgres',
  password: environment.PG_PASSWORD || 'postgres',
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/migrations/*.js'],
  database: environment.PG_DATABASE || 'postgres',
  synchronize: true,
  logging: true,
  migrationsTableName: 'migrations',
};

export default new DataSource(datasourceOptions);
