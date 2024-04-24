import { IsNotEmpty, IsOptional } from 'class-validator';
import { Exclude } from 'class-transformer';
import { ImageEntity } from '../entities/image.entity';
import { ProductDto } from './product.dto';

type Fields = {
  [P in keyof ImageEntity]: ImageEntity[P];
};

export class ImageDto implements Fields {
  constructor(partial: Partial<ImageDto>) {
    Object.assign(this, partial);
  }

  @IsNotEmpty()
  id!: string;

  @IsNotEmpty()
  url!: string;

  @IsOptional()
  name?: string;

  @IsNotEmpty()
  productId!: string;

  @Exclude()
  product!: ProductDto;
}
