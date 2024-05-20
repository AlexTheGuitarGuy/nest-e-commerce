import { Injectable } from '@nestjs/common';
import { ProductEntity } from '../entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { concatMap } from 'rxjs';
import { BufferedFile } from 'src/core/database/minio-client/models/file.model';
import { TypeormCrudRepository } from 'src/common/typeorm/typeorm-crud.repository';
import { ImagesService } from './images.service';

@Injectable()
export class ProductsService extends TypeormCrudRepository<ProductEntity> {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly _productsRepository: Repository<ProductEntity>,
    private readonly _imagesService: ImagesService,
  ) {
    super(_productsRepository);
    this._productsRepository;
    this.entityName = 'product';
  }

  uploadImage(productId: string, image: BufferedFile) {
    return this._imagesService.createOneWithMinio(productId, image).pipe(
      concatMap(() =>
        this.findOneOrThrow({
          where: { id: productId },
          relations: { images: true },
        }),
      ),
    );
  }

  removeImage(productId: string, imageId: string) {
    return this._imagesService.removeOneWithMinio(productId, imageId).pipe(
      concatMap(() =>
        this.findOneOrThrow({
          where: { id: productId },
          relations: { images: true },
        }),
      ),
    );
  }
}
