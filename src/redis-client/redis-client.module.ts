import { Module } from '@nestjs/common';
import { RedisClientService } from './services/redis-client.service';

@Module({
  providers: [RedisClientService],
  exports: [RedisClientService],
})
export class RedisClientModule {}
