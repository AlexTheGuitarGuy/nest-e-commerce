import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import Redis from 'ioredis';
import { Observable, from } from 'rxjs';

@Injectable()
export class RedisClientService {
  private _redisClient: Redis;
  constructor() {
    this._redisClient = new Redis({
      host: process.env['REDIS_HOST'] || '',
      port: parseInt(process.env['REDIS_PORT'] || '0'),
    });
  }

  get(key: string): Observable<string | null> {
    return from(this._redisClient.get(key));
  }

  set(
    key: string,
    value: string,
    expiration = dayjs().add(1, 'day').unix(),
  ): Observable<'OK'> {
    return from(this._redisClient.set(key, value, 'EX', expiration));
  }

  del(key: string): Observable<number> {
    return from(this._redisClient.del(key));
  }
}
