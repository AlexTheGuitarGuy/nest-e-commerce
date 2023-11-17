import { Module } from '@nestjs/common';
import { MongooseModule, MongooseModuleFactoryOptions } from '@nestjs/mongoose';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { environment } from 'src/environments/environment';
import Joi from '@hapi/joi';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: () => {
        const mongooseOptions: MongooseModuleFactoryOptions = Joi.object({
          uri: Joi.string().required(),
        }).validate({
          uri: environment.MONGODB_URI,
        }).value;

        return mongooseOptions;
      },
    }),
  ],
})
export class MongodbModule {}
