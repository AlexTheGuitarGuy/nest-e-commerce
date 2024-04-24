import { PartialType, PickType } from '@nestjs/swagger';
import { ProductDto } from './product.dto';

export class UpdateProductDto extends PartialType(
  PickType(ProductDto, [
    'name',
    'price',
    'category',
    'seller',
    'images',
    'description',
  ]),
) {}
