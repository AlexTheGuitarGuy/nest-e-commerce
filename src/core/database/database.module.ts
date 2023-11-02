import { Module } from '@nestjs/common';

import { PostgresModule } from './postgres/postgres.module';
import { MongodbModule } from './mongodb/mongodb.module';

@Module({
  imports: [PostgresModule, MongodbModule],
})
export class DatabaseModule {}
