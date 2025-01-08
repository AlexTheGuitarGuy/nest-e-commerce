import { Module } from '@nestjs/common';
import { MongooseModule, MongooseModuleFactoryOptions } from '@nestjs/mongoose';

import { ConfigModule, ConfigService } from '@nestjs/config';
import Joi from '@hapi/joi';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: () => {
        const {
          MONGO_URI,
          MONGO_HOST,
          MONGO_DATABASE,
          MONGO_USER,
          MONGO_USER_PASSWORD,
          MONGO_PORT,
        } = process.env;
        const uri = `${MONGO_URI}://${MONGO_USER}:${MONGO_USER_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DATABASE}`;
        const mongooseOptions: MongooseModuleFactoryOptions = Joi.object({
          uri: Joi.string().required(),
          dbName: Joi.string().required(),
        }).validate({
          uri,
          dbName: 'main',
        }).value as {
          uri: string;
          dbName: string;
        };

        return mongooseOptions;
      },
    }),
  ],
})
export class MongodbModule {}
