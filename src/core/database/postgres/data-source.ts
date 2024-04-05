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
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    username: process.env.PG_USERNAME,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
  }).value,
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/migrations/*.js'],
  synchronize: true,
  logging: true,
  migrationsTableName: 'migrations',
};

export default new DataSource(datasourceOptions);
