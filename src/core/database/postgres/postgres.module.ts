import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { postgresOptions } from './postgres-options';

@Module({
  imports: [TypeOrmModule.forRootAsync(postgresOptions)],
})
export class PostgresModule {}
