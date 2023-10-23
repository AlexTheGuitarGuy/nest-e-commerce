import { Module } from '@nestjs/common';
import { MinioClientService } from './services/minio-client.service';
import { MinioModule } from 'nestjs-minio-client';

@Module({
  imports: [
    MinioModule.register({
      endPoint: process.env['MINIO_ENDPOINT'] || 'localhost',
      port: +(process.env['MINIO_PORT'] || 9000),
      useSSL: false,
      accessKey: process.env['MINIO_ACCESS_KEY'] || 'minioadmin',
      secretKey: process.env['MINIO_SECRET_KEY'] || 'minioadmin',
    }),
  ],
  providers: [MinioClientService],
  exports: [MinioClientService],
})
export class MinioClientModule {}
