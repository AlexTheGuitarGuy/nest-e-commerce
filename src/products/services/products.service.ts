import { Injectable } from '@nestjs/common';
import { ProductEntity } from '../entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { Observable, from, map } from 'rxjs';

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
}
