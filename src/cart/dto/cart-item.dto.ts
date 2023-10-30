import { IsNotEmpty } from 'class-validator';

export class CartItemDto {
  @IsNotEmpty()
  productId!: number;

  @IsNotEmpty()
  quantity!: number;
}
