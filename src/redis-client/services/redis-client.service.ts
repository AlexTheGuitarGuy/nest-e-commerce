import Joi from '@hapi/joi';
import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import Redis from 'ioredis';
import { Observable, from } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable()
export class RedisClientService {
  private _redisClient: Redis;
  constructor() {
    this._redisClient = new Redis(
      Joi.object({
        host: Joi.string().required(),
        port: Joi.number().required(),
      }).validate({
        host: environment.REDIS_HOST,
        port: environment.REDIS_PORT,
      }).value,
    );
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
