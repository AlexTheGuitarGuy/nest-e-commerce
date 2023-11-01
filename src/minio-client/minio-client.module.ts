import { Module } from '@nestjs/common';
import { MinioClientService } from './services/minio-client.service';
import { MinioModule } from 'nestjs-minio-client';
import { environment } from 'src/environments/environment';

@Module({
  imports: [
    MinioModule.register({
      endPoint: environment.MINIO_ENDPOINT || 'localhost',
      port: environment.MINIO_PORT || 9000,
      useSSL: false,
      accessKey: environment.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: environment.MINIO_SECRET_KEY || 'minioadmin',
    }),
  ],
  providers: [MinioClientService],
  exports: [MinioClientService],
})
export class MinioClientModule {}
