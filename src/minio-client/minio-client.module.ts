import { Module } from '@nestjs/common';
import { MinioClientService } from './services/minio-client.service';
import { MinioModule } from 'nestjs-minio-client';
import Joi from '@hapi/joi';

@Module({
  imports: [
    MinioModule.register({
      ...Joi.object({
        endPoint: Joi.string().required(),
        port: Joi.number().required(),
        accessKey: Joi.string().required(),
        secretKey: Joi.string().required(),
      }).validate({
        endPoint: process.env.MINIO_ENDPOINT,
        port: process.env.MINIO_PORT,
        accessKey: process.env.MINIO_ACCESS_KEY,
        secretKey: process.env.MINIO_SECRET_KEY,
      }).value,

      useSSL: false,
    }),
  ],
  providers: [MinioClientService],
  exports: [MinioClientService],
})
export class MinioClientModule {}
