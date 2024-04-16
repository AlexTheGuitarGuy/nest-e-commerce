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
        const mongooseOptions: MongooseModuleFactoryOptions = Joi.object({
          uri: Joi.string().required(),
          dbName: Joi.string().required(),
        }).validate({
          uri: process.env.MONGODB_URI,
          dbName: 'main',
        }).value;

        return mongooseOptions;
      },
    }),
  ],
})
export class MongodbModule {}
