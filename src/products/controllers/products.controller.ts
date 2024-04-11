import {
  BadRequestException,
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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { PageOptionsDto } from 'src/common/dto/page-options-dto';
import { ProductsService } from '../services/products.service';
import { ProductDto } from '../dto/product.dto';
import { CreateProductDto } from '../dto/create-product.dto';
import { plainToInstance } from 'class-transformer';
import { Observable, map, tap, concatMap } from 'rxjs';
import { PageDto } from 'src/common/dto/page.dto';
import { PageMetaDto } from 'src/common/dto/page-meta.dto';
import { Role } from 'src/common/enums/role.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserDto } from 'src/users/dto/user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ImageFileFilter } from 'src/common/filters/image-file.filter';
import { MAX_FILE_SIZE } from 'src/common/constants';
import { BufferedFile } from 'src/core/database/minio-client/models/file.model';

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
      .findMany({}, { seller: true, images: true }, {}, take, skip)
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
    return this._productsService.findOneById(
      id,
      { seller: true, images: true },
      {},
    );
  }

  @Post()
  @Roles(Role.Admin, Role.Seller)
  create(@Body() createProductDto: CreateProductDto, @Req() req: Request) {
    return this._productsService
      .create(createProductDto, req.user as UserDto)
      .pipe(map(() => ({ message: 'Product created' })));
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
      concatMap(() => {
        return this._productsService.updateOne(id, updateProductDto);
      }),
    );
  }

  @Delete(':id')
  @Roles(Role.Admin, Role.Seller)
  removeOne(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const user = req.user as UserDto;
    return this._checkSellerProductRelation(id, user).pipe(
      concatMap(() => {
        return this._productsService.removeOne(id).pipe(
          map(() => ({
            result: HttpStatus.OK,
            message: 'Product deleted',
          })),
        );
      }),
    );
  }

  @Post(':id/image')
  @Roles(Role.Admin, Role.Seller)
  @UseInterceptors(
    FileInterceptor('image', {
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: ImageFileFilter,
    }),
  )
  uploadImage(
    @Param('id', ParseIntPipe) productId: number,
    @UploadedFile() image: BufferedFile,
    @Req() req: Request,
  ) {
    const user = req.user as UserDto;
    if (!image) throw new BadRequestException('Image is required');

    return this._checkSellerProductRelation(productId, user).pipe(
      concatMap(() => this._productsService.uploadImage(productId, image)),
    );
  }

  @Delete(':id/image/:imageId')
  @Roles(Role.Admin, Role.Seller)
  removeImage(
    @Param('id', ParseIntPipe) productId: number,
    @Param('imageId', ParseIntPipe) imageId: number,
    @Req() req: Request,
  ) {
    const user = req.user as UserDto;
    return this._checkSellerProductRelation(productId, user).pipe(
      concatMap(() => {
        return this._productsService.removeImage(productId, imageId);
      }),
    );
  }
}
