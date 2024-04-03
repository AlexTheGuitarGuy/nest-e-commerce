import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { datasourceOptions } from './data-source';

export const mongodbConfig = registerAs(
  'mongodb',
  (): TypeOrmModuleOptions => datasourceOptions,
);
