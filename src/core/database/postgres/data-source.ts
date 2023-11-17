import { environment } from 'src/environments/environment';
import { DataSource, DataSourceOptions } from 'typeorm';
import Joi from '@hapi/joi';

export const datasourceOptions: DataSourceOptions = {
  type: 'postgres',
  ...Joi.object({
    host: Joi.string().required(),
    port: Joi.number().required(),
    username: Joi.string().required(),
    password: Joi.string().required(),
    database: Joi.string().required(),
  }).validate({
    host: environment.PG_HOST,
    port: environment.PG_PORT,
    username: environment.PG_USERNAME,
    password: environment.PG_PASSWORD,
    database: environment.PG_DATABASE,
  }).value,
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/migrations/*.js'],
  synchronize: true,
  logging: true,
  migrationsTableName: 'migrations',
};

export default new DataSource(datasourceOptions);
