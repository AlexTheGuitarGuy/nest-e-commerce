import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { mongodbOptions } from './mongodb-options';

@Module({
  imports: [TypeOrmModule.forRootAsync(mongodbOptions)],
})
export class MongodbModule {}
