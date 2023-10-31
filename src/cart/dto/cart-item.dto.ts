import { IsNotEmpty, Min } from 'class-validator';
import { ProductDto } from 'src/products/dto/product.dto';

export class CartItemDto {
  @IsNotEmpty()
  product!: ProductDto;

  @IsNotEmpty()
  @Min(1, { message: 'Quantity must be greater than 0' })
  quantity!: number;
}
