import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { PageOptionsDto } from 'src/common/dto/page-options-dto';
import { ProductsService } from '../services/products.service';
import { ProductDto } from '../dto/product.dto';
import { CreateProductDto } from '../dto/create-product.dto';
import { plainToInstance } from 'class-transformer';
import { Observable, map } from 'rxjs';
import { PageDto } from 'src/common/dto/page.dto';
import { PageMetaDto } from 'src/common/dto/page-meta.dto';
import { Role } from 'src/common/enums/role.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ImageFileFilter } from 'src/common/filters/image-file.filter';
import { MAX_FILE_SIZE } from 'src/common/constants';
import { BufferedFile } from 'src/core/database/minio-client/models/file.model';
import { SellerIntegrityGuard } from '../guards/seller-integrity.guard';

@Controller('products')
export class ProductsController {
  constructor(private readonly _productsService: ProductsService) {}

  @Get()
  findAll(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Observable<PageDto<ProductDto>> {
    const { take, skip } = pageOptionsDto;
    return this._productsService
      .findMany({
        take,
        skip,
        relations: {
          seller: true,
          images: true,
        },
      })
      .pipe(
        map((items) => {
          const products = items.map((product) =>
            plainToInstance(ProductDto, product),
          );

          return new PageDto(
            products,
            new PageMetaDto({ itemCount: products.length, pageOptionsDto }),
          );
        }),
      );
  }

  @Get(':id')
  findOneById(@Param('id') id: string) {
    return this._productsService.findOneOrThrow({
      where: { id },
      relations: { seller: true, images: true },
    });
  }

  @Post()
  @Roles(Role.Admin, Role.Seller)
  createOne(@Body() createProductDto: CreateProductDto, @Req() req: Request) {
    return this._productsService.createOne({
      ...createProductDto,
      seller: req.user,
    });
  }

  @Patch(':id')
  @Roles(Role.Admin, Role.Seller)
  @UseGuards(SellerIntegrityGuard)
  updateOne(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this._productsService.updateOne({ where: { id } }, updateProductDto);
  }

  @Delete(':id')
  @Roles(Role.Admin, Role.Seller)
  @UseGuards(SellerIntegrityGuard)
  removeOne(@Param('id') id: string) {
    return this._productsService.removeOne({ where: { id } });
  }

  @Post(':id/image')
  @Roles(Role.Admin, Role.Seller)
  @UseGuards(SellerIntegrityGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: ImageFileFilter,
    }),
  )
  uploadImage(
    @Param('id') productId: string,
    @UploadedFile() image: BufferedFile,
  ) {
    if (!image) throw new BadRequestException('Image is required');

    return this._productsService.uploadImage(productId, image);
  }

  @Delete(':id/image/:imageId')
  @Roles(Role.Admin, Role.Seller)
  @UseGuards(SellerIntegrityGuard)
  removeImage(
    @Param('id') productId: string,
    @Param('imageId') imageId: string,
  ) {
    return this._productsService.removeImage(productId, imageId);
  }
}
