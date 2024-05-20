import { Injectable } from '@nestjs/common';
import { TypeormCrudRepository } from 'src/common/typeorm/typeorm-crud.repository';
import { ImageEntity } from '../entities/image.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MinioClientService } from 'src/core/database/minio-client/services/minio-client.service';
import { concatMap } from 'rxjs';
import { BufferedFile } from 'src/core/database/minio-client/models/file.model';

@Injectable()
export class ImagesService extends TypeormCrudRepository<ImageEntity> {
  constructor(
    @InjectRepository(ImageEntity)
    private readonly _imagesRepository: Repository<ImageEntity>,
    private readonly _minioClientService: MinioClientService,
  ) {
    super(_imagesRepository);
    this._imagesRepository;
    this.entityName = 'image';
  }

  createOneWithMinio(productId: string, image: BufferedFile) {
    return this._minioClientService
      .upload(image)
      .pipe(
        concatMap(({ url, fileName }) =>
          this.createOne({ url, name: fileName, productId }),
        ),
      );
  }

  removeOneWithMinio(productId: string, imageId: string) {
    return this.removeOne({ where: { id: imageId, productId } }).pipe(
      concatMap((image) => this._minioClientService.delete(image.name || '')),
    );
  }
}
