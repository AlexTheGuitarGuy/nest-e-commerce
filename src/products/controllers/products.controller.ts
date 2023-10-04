import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PageOptionsDto } from 'src/common/dto/page-options-dto';
import { ProductsService } from '../services/products.service';
import { ProductDto } from '../dto/product.dto';
import { CreateProductDto } from '../dto/create-product.dto';
import { plainToInstance } from 'class-transformer';
import { Observable, map } from 'rxjs';
import { PageDto } from 'src/common/dto/page.dto';
import { PageMetaDto } from 'src/common/dto/page-meta.dto';
import { UpdateProductDto } from '../dto/update-produtct.dto';
import { Role } from 'src/common/enums/role.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';

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

  @Get(':id')
  findOneById(@Param('id', ParseIntPipe) id: number) {
    return this._productsService.findOneById(id);
  }

  @Post()
  @Roles(Role.Admin, Role.Seller)
  create(@Body() createProductDto: CreateProductDto) {
    return this._productsService.create(createProductDto);
  }

  @Patch(':id')
  @Roles(Role.Admin, Role.Seller)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    console.log('updateProductDto', updateProductDto);
    console.log('id', id);

    return this._productsService.updateOne(id, updateProductDto);
  }

  @Delete(':id')
  @Roles(Role.Admin, Role.Seller)
  removeOne(@Param('id', ParseIntPipe) id: number) {
    return this._productsService
      .removeOne(id)
      .pipe(
        map((_) => ({ result: HttpStatus.OK, message: 'Product deleted' })),
      );
  }
}
