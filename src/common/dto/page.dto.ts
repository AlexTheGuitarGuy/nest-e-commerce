import { Expose } from 'class-transformer';
import { IsArray } from 'class-validator';

import { PageMetaDto } from './page-meta.dto';

export class PageDto<T> {
  @IsArray()
  @Expose()
  readonly results: T[];

  @Expose()
  readonly meta: PageMetaDto;

  constructor(results: T[], meta: PageMetaDto) {
    this.results = results;
    this.meta = meta;
  }
}
