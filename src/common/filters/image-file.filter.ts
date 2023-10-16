import { HttpException, HttpStatus } from '@nestjs/common';

export const ImageFileFilter = (_req, file, callback) => {
  if (!file.originalname.match(/\.(gif|jpe?g|tiff?|png|webp|bmp)$/i)) {
    callback(
      new HttpException('Only image are allowed', HttpStatus.BAD_REQUEST),
      false,
    );
  }
  callback(null, true);
};
