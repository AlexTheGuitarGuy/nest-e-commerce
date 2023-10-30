import { IsNotEmpty, Min } from 'class-validator';

export class CartItemDto {
  @IsNotEmpty()
  productId!: number;

  @IsNotEmpty()
  @Min(1, { message: 'Quantity must be greater than 0' })
  quantity!: number;
}
