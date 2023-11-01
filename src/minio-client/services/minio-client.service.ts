import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { MinioService } from 'nestjs-minio-client';
import { BufferedFile } from '../models/file.model';
import * as crypto from 'crypto';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable()
export class MinioClientService {
  private readonly logger: Logger;
  private readonly baseBucket = environment.MINIO_BUCKET_NAME;

  public get client() {
    return this.minio.client;
  }

  constructor(private readonly minio: MinioService) {
    this.logger = new Logger('MinioStorageService');
  }

  public upload(
    file: BufferedFile,
    baseBucket: string = this.baseBucket || '',
  ): Observable<{ url: string; filename: string }> {
    this.logger.log('uploading file: ', file.originalname);
    if (!(file.mimetype.includes('jpeg') || file.mimetype.includes('png'))) {
      throw new HttpException('Error uploading file', HttpStatus.BAD_REQUEST);
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
      'X-Amz-Meta-Testing': 1234,
    };
    let filename = hashedFileName + ext;
    const fileName: string = `${filename}`;
    const fileBuffer = file.buffer;
    this.client.putObject(
      baseBucket,
      fileName,
      fileBuffer,
      metaData,
      function (err: Error, _: any) {
        if (err)
          throw new HttpException(
            'Error uploading file',
            HttpStatus.BAD_REQUEST,
          );
      },
    );

    return of({
      url: `${environment.MINIO_ENDPOINT}:${environment.MINIO_PORT}/${environment.MINIO_BUCKET_NAME}/${filename}`,
      filename,
    });
  }

  delete(
    objetName: string,
    baseBucket: string = this.baseBucket || '',
  ): Observable<void> {
    this.logger.log('deleting file: ', objetName);
    this.client.removeObject(
      baseBucket,
      objetName,
      function (err: Error, _: any) {
        if (err)
          throw new HttpException(
            'Oops Something wrong happend',
            HttpStatus.BAD_REQUEST,
          );
      },
    );
    return of(void 0);
  }
}
