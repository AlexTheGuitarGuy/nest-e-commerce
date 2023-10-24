import { IsNotEmpty } from 'class-validator';
import { ProductEntity } from 'src/products/entities/product.entity';
import { CartEntity } from '../entities/cart.entity';

export class CartItemDto {
  @IsNotEmpty()
  id!: number;

  @IsNotEmpty()
  product!: ProductEntity;

  @IsNotEmpty()
  cart!: CartEntity;

  @IsNotEmpty()
  quantity!: number;
}
