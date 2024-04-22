import { IsNotEmpty, IsOptional } from 'class-validator';
import { ProductDto } from './product.dto';

export class ImageDto {
  @IsNotEmpty()
  id!: string;

  @IsNotEmpty()
  url!: string;

  @IsOptional()
  name?: string;

  @IsNotEmpty()
  product!: ProductDto;
}
