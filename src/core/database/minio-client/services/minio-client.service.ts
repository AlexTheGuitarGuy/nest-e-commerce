import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { MinioService, MinioClient } from 'nestjs-minio-client';
import { BufferedFile } from '../models/file.model';
import * as crypto from 'crypto';
import { Observable, of } from 'rxjs';

@Injectable()
export class MinioClientService {
  private readonly logger: Logger;
  private readonly baseBucket = process.env.MINIO_BUCKET_NAME;

  public get client(): MinioClient {
    return this.minio.client;
  }

  constructor(private readonly minio: MinioService) {
    this.logger = new Logger('MinioStorageService');
  }

  public upload(
    file: BufferedFile,
    baseBucket: string = this.baseBucket || '',
  ): Observable<{ url: string; fileName: string }> {
    this.logger.log('uploading file: ', file.originalname);
    if (!(file.mimetype.includes('jpeg') || file.mimetype.includes('png'))) {
      throw new BadRequestException('Error uploading file');
    }
    let temp_filename = Date.now().toString();
    let hashedFileName = crypto
      .createHash('md5')
      .update(temp_filename)
      .digest('hex');
    let ext = file.originalname.substring(
      file.originalname.lastIndexOf('.'),
      file.originalname.length,
    );
    const metaData = {
      'Content-Type': file.mimetype,
    };
    let fileName = (hashedFileName + ext).toString();
    this.client.putObject(
      baseBucket,
      fileName,
      file.buffer,
      file.size,
      metaData,
      function (err) {
        if (err) throw new BadRequestException('Error uploading file');
      },
    );

    return of({
      url: `${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${process.env.MINIO_BUCKET_NAME}/${fileName}`,
      fileName,
    });
  }

  delete(
    objetName: string,
    baseBucket: string = this.baseBucket || '',
  ): Observable<void> {
    this.logger.log('deleting file: ', objetName);
    this.client.removeObject(baseBucket, objetName, function (err) {
      if (err) throw new BadRequestException('Oops Something wrong happend');
    });
    return of(void 0);
  }
}
