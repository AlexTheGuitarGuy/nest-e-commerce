import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateCartDto {
  @IsOptional()
  userId?: number;

  @IsNotEmpty()
  productId!: number;

  @IsNotEmpty()
  quantity!: number;
}
