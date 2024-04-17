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
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
  }).value,
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/migrations/*.js'],
  synchronize: true,
  logging: true,
  migrationsTableName: 'migrations',
};

export default new DataSource(datasourceOptions);
