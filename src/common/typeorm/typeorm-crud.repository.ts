import { NotFoundException } from '@nestjs/common';
import { Observable, from, map, concatMap } from 'rxjs';
import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  FindOptionsSelect,
  FindOptionsWhere,
  In,
  Repository,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { LogMethods } from '../decorators/logging.decorator';

interface Entity {
  id: string;
}

type CrudRepositoryOptions<TExtra = {}> = {} & TExtra;

interface CrudRepository<E> {
  findOne(
    findOptions: FindOneOptions<E>,
    options: CrudRepositoryOptions,
  ): Observable<E | null>;
  findOneOrThrow(
    findOptions: FindOneOptions<E>,
    options: CrudRepositoryOptions,
  ): Observable<E>;
  findMany(
    findOptions: FindManyOptions<E>,
    options: CrudRepositoryOptions,
  ): Observable<E[]>;
  createOne(dto: DeepPartial<E>, options: CrudRepositoryOptions): Observable<E>;
  createMany(
    dtos: DeepPartial<E>[],
    options: CrudRepositoryOptions,
  ): Observable<E>;
  updateOne(
    findOptions: FindOneOptions<E>,
    dto: QueryDeepPartialEntity<E>,
    options: CrudRepositoryOptions,
  ): Observable<E>;
  updateMany(
    findOptions: FindManyOptions<E>,
    dto: QueryDeepPartialEntity<E>,
    options: CrudRepositoryOptions,
  ): Observable<E[]>;
  removeOne(
    findOptions: FindOneOptions<E>,
    options: CrudRepositoryOptions<{
      softRemove?: boolean;
    }>,
  ): Observable<E>;
  removeMany(
    findOptions: FindOneOptions<E>,
    options: CrudRepositoryOptions,
  ): Observable<E[]>;
}

@LogMethods()
export class TypeormCrudRepository<E extends Entity>
  implements CrudRepository<E>
{
  constructor(private readonly repository: Repository<E>) {}
  private _entityName?: string;

  public set entityName(entityName: string) {
    this._entityName = entityName;
  }

  public get entityName() {
    return this._entityName || 'entity';
  }

  createOne(dto: DeepPartial<E>): Observable<E> {
    const entity: E = this.repository.create(dto);
    return from(this.repository.save(entity));
  }

  createMany(dtos: DeepPartial<E>[]): Observable<E> {
    const entities: E[] = dtos.map((dto) => this.repository.create(dto));
    return from(entities).pipe(
      concatMap((entity) => from(this.repository.save(entity))),
    );
  }

  findOne(findOptions: FindOneOptions<E>): Observable<E | null> {
    return from(this.repository.findOne(findOptions));
  }

  findOneOrThrow(findOptions: FindOneOptions<E>): Observable<E> {
    return from(this.repository.findOne(findOptions)).pipe(
      map((entity) => {
        if (!entity) {
          const titleCaseEntityName = !!this.entityName
            ? this.entityName[0].toUpperCase() +
              this.entityName.slice(1).toLowerCase()
            : undefined;
          throw new NotFoundException(
            `${titleCaseEntityName || 'Entity'} not found`,
          );
        }

        return entity;
      }),
    );
  }

  findMany(findOptions: FindManyOptions<E>): Observable<E[]> {
    return from(this.repository.find(findOptions));
  }

  updateOne(
    findOptions: FindOneOptions<E>,
    dto: QueryDeepPartialEntity<E>,
  ): Observable<E> {
    return from(
      this.findOneOrThrow({
        where: findOptions.where,
        select: { id: true } as FindOptionsSelect<E>,
      }),
    ).pipe(
      concatMap((entity) =>
        from(
          this.repository.update({ id: entity.id } as FindOptionsWhere<E>, dto),
        ).pipe(map(() => entity)),
      ),
      concatMap((entity) =>
        this.findOneOrThrow({
          ...findOptions,
          where: { id: entity.id } as FindOptionsWhere<E>,
        }),
      ),
    );
  }

  updateMany(
    findOptions: FindOneOptions<E>,
    dto: QueryDeepPartialEntity<E>,
  ): Observable<E[]> {
    return from(
      this.findMany({
        where: findOptions.where,
        select: { id: true } as FindOptionsSelect<E>,
      }),
    ).pipe(
      map((entities) => entities.map((entity) => entity.id)),
      concatMap((ids) =>
        from(this.repository.update(ids, dto)).pipe(map(() => ids)),
      ),
      concatMap((ids) =>
        this.findMany({
          ...findOptions,
          where: { id: In(ids) } as FindOptionsWhere<E>,
        }),
      ),
    );
  }

  removeOne(
    findOptions: FindOneOptions<E>,
    { softRemove = true }: CrudRepositoryOptions<{ softRemove?: boolean }> = {},
  ): Observable<E> {
    return from(this.findOneOrThrow(findOptions)).pipe(
      concatMap((entity) =>
        from(
          softRemove
            ? this.repository.softRemove(entity)
            : this.repository.remove(entity),
        ),
      ),
    );
  }

  removeMany(
    findOptions: FindOneOptions<E>,
    { softRemove }: CrudRepositoryOptions<{ softRemove?: boolean }> = {},
  ): Observable<E[]> {
    return from(this.repository.find(findOptions)).pipe(
      concatMap((entities) =>
        from(
          softRemove
            ? this.repository.softRemove(entities)
            : this.repository.remove(entities),
        ),
      ),
    );
  }
}
