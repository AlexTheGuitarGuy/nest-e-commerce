import { Module } from '@nestjs/common';
import { MongooseModule, MongooseModuleFactoryOptions } from '@nestjs/mongoose';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { environment } from 'src/environments/environment';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: () => {
        const mongooseOptions: MongooseModuleFactoryOptions = {
          uri: environment.MONGODB_URI,
        };

        return mongooseOptions;
      },
    }),
  ],
})
export class MongodbModule {}
