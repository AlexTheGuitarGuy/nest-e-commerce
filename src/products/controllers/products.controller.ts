import { Controller, Get, Query } from '@nestjs/common';
import { PageOptionsDto } from 'src/common/dto/page-options-dto';
import { ProductsService } from '../services/products.service';
import { ProductDto } from '../dto/product.dto';
import { plainToInstance } from 'class-transformer';
import { Observable, map } from 'rxjs';
import { PageDto } from 'src/common/dto/page.dto';
import { PageMetaDto } from 'src/common/dto/page-meta.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly _productsService: ProductsService) {}

  @Get()
  findAll(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Observable<PageDto<ProductDto>> {
    const { take, skip } = pageOptionsDto;
    return this._productsService.findMany({}, {}, {}, take, skip).pipe(
      map(({ items, itemsCount }) => {
        const products = items.map((product) =>
          plainToInstance(ProductDto, product),
        );

        return new PageDto(
          products,
          new PageMetaDto({ itemCount: itemsCount, pageOptionsDto }),
        );
      }),
    );
  }
}
