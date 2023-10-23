import { HttpException, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { AppMimeType, BufferedFile } from 'src/minio-client/models/file.model';

export const ImageFileFilter = (
  _req: Request,
  file: BufferedFile | (Omit<BufferedFile, 'mimetype'> & { mimetype: string }),
  callback: (result: HttpException | null, pass: boolean) => void,
) => {
  if (!isAppMimeType(file.mimetype)) {
    callback(
      new HttpException(
        'Only png or jpeg images are allowed',
        HttpStatus.BAD_REQUEST,
      ),
      false,
    );
    return void 0;
  }

  if (!file.originalname.match(/\.(gif|jpe?g|tiff?|png|webp|bmp)$/i)) {
    callback(
      new HttpException('Only image are allowed', HttpStatus.BAD_REQUEST),
      false,
    );
    return void 0;
  }

  callback(null, true);
};

export const isAppMimeType = (mimetype: string): mimetype is AppMimeType => {
  return mimetype === 'image/jpeg' || mimetype === 'image/png';
};
