import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ProductEntity } from '../entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { Observable, forkJoin, from, map, concatMap, tap } from 'rxjs';
import { CreateProductDto } from '../dto/create-product.dto';
import { plainToClass, plainToInstance } from 'class-transformer';
import { PostgresErrorCode } from 'src/common/enums/postgres-error-code.enum';
import { ProductDto } from '../dto/product.dto';
import { UserDto } from 'src/users/dto/user.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ImageDto } from '../dto/image.dto';
import { BufferedFile } from 'src/core/database/minio-client/models/file.model';
import { MinioClientService } from 'src/core/database/minio-client/services/minio-client.service';
import { ImageEntity } from '../entities/image.entity';
import { UsersService } from 'src/users/services/users.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly _productsRepository: Repository<ProductEntity>,
    @InjectRepository(ImageEntity)
    private readonly _imagesRepository: Repository<ImageEntity>,
    private readonly _usersService: UsersService,
    private readonly _minioClientService: MinioClientService,
  ) {}

  findMany(
    where: FindOptionsWhere<ProductEntity>,
    relations: FindOptionsRelations<ProductEntity>,
    select: FindOptionsSelect<ProductEntity>,
    take: number = 50,
    skip: number = 0,
  ): Observable<{ items: ProductDto[]; itemsCount: number }> {
    return from(
      this._productsRepository.findAndCount({
        where,
        relations,
        select: { ...select },
        take,
        skip,
      }),
    ).pipe(
      map(([items, itemsCount]) => {
        const logPayload = {
          where,
          relations,
          select,
        };
        if (items.length) {
          Object.assign(logPayload, { ids: items.map((e) => e.id) });
        }

        const formattedItems = plainToInstance(ProductDto, items);
        return { items: formattedItems, itemsCount };
      }),
    );
  }

  createOne(createProductDto: CreateProductDto, seller: UserDto) {
    return from(this._usersService.findOneOrThrow({
      where: { id: seller.id },
    })).pipe(
      concatMap((foundSeller) => {
        const product = this._productsRepository.create({
          ...createProductDto,
          seller: foundSeller,
        });

        return from(this._productsRepository.save(product));
      }),
      map((product) => plainToInstance(ProductDto, product)),
    );
  }

  updateOne(id: string, updateProductDto: UpdateProductDto) {
    return from(this._productsRepository.findOne({ where: { id } })).pipe(
      map((found) => {
        if (!found) {
          throw new NotFoundException(`Product with id ${id} not found`);
        }
        return found;
      }),
      concatMap((found) => {
        try {
          const updated = this._productsRepository.merge(
            found,
            updateProductDto,
          );
          return from(this._productsRepository.save(updated));
        } catch (error: any) {
          if (error?.code === PostgresErrorCode.UniqueViolation) {
            throw new BadRequestException('This product already exists');
          }
          throw new InternalServerErrorException('Failed to update product');
        }
      }),
      map((product) => plainToInstance(ProductDto, product)),
    );
  }

  removeOne(id: string) {
    return from(this._productsRepository.delete(id)).pipe(
      tap((deleted) => {
        if (deleted.affected === 0) {
          throw new NotFoundException(`Product with id ${id} not found`);
        }
      }),
    );
  }

  findOneById(
    id: string,
    relations: FindOptionsRelations<ProductEntity>,
    select: FindOptionsSelect<ProductEntity>,
  ) {
    return from(
      this._productsRepository.findOne({
        where: { id },
        relations,
        select: { ...select },
      }),
    ).pipe(
      map((product) => {
        if (!product) {
          throw new NotFoundException(`Product with id ${id} not found`);
        }

        return plainToClass(ProductDto, product);
      }),
    );
  }

  uploadImage(productId: string, image: BufferedFile) {
    return from(
      this.findOneById(productId, { seller: true, images: true }, {}),
    ).pipe(
      concatMap((found) =>
        this._minioClientService.upload(image).pipe(
          map(({ url, filename }) => {
            return { found, url, filename };
          }),
        ),
      ),
      concatMap(({ found, url, filename }) =>
        this.updateOne(productId, {
          images: [
            ...(found?.images || []),
            {
              url,
              name: filename,
            } as ImageDto,
          ],
        }),
      ),
    );
  }

  removeImage(productId: string, imageId: string) {
    return from(
      this.findOneById(productId, { seller: true, images: true }, {}),
    ).pipe(
      concatMap((found) => {
        const image = found.images?.find((e) => e.id === imageId);
        if (!image?.name) throw new NotFoundException('Image not found');

        return forkJoin([
          this._minioClientService.delete(image.name),
          this._imagesRepository.delete(imageId),
        ]).pipe(
          map(() => {
            return found;
          }),
        );
      }),
      concatMap((found) =>
        this.updateOne(productId, {
          images: found.images?.filter((e) => e.id !== imageId) || [],
        }),
      ),
    );
  }
}
