import { Module } from '@nestjs/common';
import { MinioClientService } from './services/minio-client.service';
import { MinioModule } from 'nestjs-minio-client';
import { environment } from 'src/environments/environment';
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
        endPoint: environment.MINIO_ENDPOINT,
        port: environment.MINIO_PORT,
        accessKey: environment.MINIO_ACCESS_KEY,
        secretKey: environment.MINIO_SECRET_KEY,
      }).value,

      useSSL: false,
    }),
  ],
  providers: [MinioClientService],
  exports: [MinioClientService],
})
export class MinioClientModule {}
