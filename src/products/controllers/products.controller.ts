import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { PageOptionsDto } from 'src/common/dto/page-options-dto';
import { ProductsService } from '../services/products.service';
import { ProductDto } from '../dto/product.dto';
import { CreateProductDto } from '../dto/create-product.dto';
import { plainToInstance } from 'class-transformer';
import { Observable, map, tap, switchMap } from 'rxjs';
import { PageDto } from 'src/common/dto/page.dto';
import { PageMetaDto } from 'src/common/dto/page-meta.dto';
import { UpdateProductDto } from '../dto/update-produtct.dto';
import { Role } from 'src/common/enums/role.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserDto } from 'src/users/dto/user.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly _productsService: ProductsService) {}
  private _checkSellerProductRelation(
    productId: number,
    user: UserDto,
    productDto?: UpdateProductDto,
  ): Observable<ProductDto> {
    return this._productsService
      .findOneById(productId, { seller: true }, {})
      .pipe(
        tap((product) => {
          if (user.role !== Role.Admin) {
            if (product?.seller.id !== user.id)
              throw new ForbiddenException(
                'You cannot change a product that is not yours',
              );
            if (productDto && 'seller' in productDto)
              throw new ForbiddenException(
                'You cannot change the seller of a product',
              );
          }
        }),
      );
  }

  @Get()
  findAll(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Observable<PageDto<ProductDto>> {
    const { take, skip } = pageOptionsDto;
    return this._productsService
      .findMany({}, { seller: true }, {}, take, skip)
      .pipe(
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
    return this._productsService.findOneById(id, { seller: true }, {});
  }

  @Post()
  @Roles(Role.Admin, Role.Seller)
  create(@Body() createProductDto: CreateProductDto, @Req() req: Request) {
    return this._productsService
      .create(createProductDto, req.user as UserDto)
      .pipe(map(() => ({ status: HttpStatus.CREATED })));
  }

  @Patch(':id')
  @Roles(Role.Admin, Role.Seller)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
    @Req() req: Request,
  ) {
    const user = req.user as UserDto;
    return this._checkSellerProductRelation(id, user, updateProductDto).pipe(
      switchMap(() => {
        return this._productsService.updateOne(id, updateProductDto);
      }),
    );
  }

  @Delete(':id')
  @Roles(Role.Admin, Role.Seller)
  removeOne(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const user = req.user as UserDto;
    return this._checkSellerProductRelation(id, user).pipe(
      switchMap(() => {
        return this._productsService.removeOne(id).pipe(
          map(() => ({
            result: HttpStatus.OK,
            message: 'Product deleted',
          })),
        );
      }),
    );
  }
}
