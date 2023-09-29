import { Expose } from 'class-transformer';
import { IsBoolean, IsInt, IsNotEmpty, Min } from 'class-validator';
import { PageMetaDtoParameters } from '../interfaces/page-meta-dto-parameters.interface';

export class PageMetaDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Expose()
  readonly page: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Expose()
  readonly take: number;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Expose()
  readonly itemCount: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Expose()
  readonly pageCount: number;

  @IsNotEmpty()
  @IsBoolean()
  @Expose()
  readonly hasPreviousPage: boolean;

  @IsNotEmpty()
  @IsBoolean()
  @Expose()
  readonly hasNextPage: boolean;

  constructor({ pageOptionsDto, itemCount }: PageMetaDtoParameters) {
    this.page = pageOptionsDto.page ?? 0;
    this.take = pageOptionsDto.take ?? 0;
    this.itemCount = itemCount;
    this.pageCount = Math.ceil(this.itemCount / this.take);
    this.hasPreviousPage = this.page > 1;
    this.hasNextPage = this.page < this.pageCount;
  }
}
