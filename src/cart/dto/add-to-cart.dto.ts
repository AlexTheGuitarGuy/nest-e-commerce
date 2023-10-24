import { IsNotEmpty, IsOptional } from 'class-validator';

export class AddToCartDto {
  @IsOptional()
  userId?: number;

  @IsNotEmpty()
  productId!: number;

  @IsNotEmpty()
  quantity!: number;
}
