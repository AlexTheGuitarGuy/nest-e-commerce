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
import { Observable, catchError, from, map, switchMap, tap } from 'rxjs';
import { CreateProductDto } from '../dto/create-product.dto';
import { plainToClass, plainToInstance } from 'class-transformer';
import { UpdateProductDto } from '../dto/update-produtct.dto';
import { PostgresErrorCode } from 'src/common/enums/postgres-error-code.enum';
import { ProductDto } from '../dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly _productsRepository: Repository<ProductEntity>,
  ) {}

  findMany(
    where: FindOptionsWhere<ProductEntity>,
    relations: FindOptionsRelations<ProductEntity>,
    select: FindOptionsSelect<ProductEntity>,
    take: number = 50,
    skip: number = 0,
  ): Observable<{ items: ProductEntity[]; itemsCount: number }> {
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

        return { items, itemsCount };
      }),
    );
  }

  create(createProductDto: CreateProductDto) {
    const product = this._productsRepository.create(createProductDto);
    return from(this._productsRepository.save(product)).pipe(
      catchError((error: any) => {
        throw new BadRequestException(error.detail);
      }),
      map((product) => plainToClass(ProductEntity, product)),
    );
  }

  updateOne(id: number, updateProductDto: UpdateProductDto) {
    return from(this._productsRepository.findOne({ where: { id } })).pipe(
      map((found) => {
        if (!found) {
          throw new NotFoundException(`Product with id ${id} not found`);
        }
        return found;
      }),
      switchMap((found) => {
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
      catchError((error: any) => {
        throw new BadRequestException(error.detail);
      }),
      map((product) => plainToInstance(ProductDto, product)),
    );
  }

  removeOne(id: number) {
    return from(this._productsRepository.delete(id)).pipe(
      tap((deleted) => {
        if (deleted.affected === 0) {
          throw new NotFoundException(`Product with id ${id} not found`);
        }
      }),
    );
  }

  findOneById(id: number) {
    return from(this._productsRepository.findOne({ where: { id } }));
  }
}
