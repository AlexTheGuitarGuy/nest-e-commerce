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
import { UserDto } from 'src/users/dto/user.dto';
import { UserEntity } from 'src/users/entities/user.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly _productsRepository: Repository<ProductEntity>,
    @InjectRepository(UserEntity)
    private readonly _usersRepository: Repository<UserEntity>,
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

  create(createProductDto: CreateProductDto, seller: UserDto) {
    return from(
      this._usersRepository.findOne({ where: { id: seller.id } }),
    ).pipe(
      map((foundSeller) => {
        if (!foundSeller) {
          throw new NotFoundException(`User with id ${seller.id} not found`);
        }
        return foundSeller;
      }),
      switchMap((foundSeller) => {
        const product = this._productsRepository.create({
          ...createProductDto,
          seller: foundSeller,
        });

        return from(this._productsRepository.save(product));
      }),
      catchError((error: any) => {
        throw new BadRequestException(error.detail);
      }),
      map((product) => plainToInstance(ProductDto, product)),
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

  findOneById(
    id: number,
    relations: FindOptionsRelations<ProductEntity>,
    select: FindOptionsSelect<ProductEntity>,
  ) {
    return from(
      this._productsRepository.findOne({
        where: { id },
        relations,
        select: { ...select },
      }),
    ).pipe(map((product) => plainToClass(ProductDto, product)));
  }
}
