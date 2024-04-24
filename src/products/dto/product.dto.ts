import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ProductCategory } from 'src/common/enums/product-category.enum';
import { UserDto } from 'src/users/dto/user.dto';
import { ImageDto } from './image.dto';
import { ProductEntity } from '../entities/product.entity';
import { Expose } from 'class-transformer';

type Fields = {
  [P in keyof ProductEntity]: ProductEntity[P];
};

@Expose()
export class ProductDto implements Fields {
  constructor(partial: Partial<ProductDto>) {
    Object.assign(this, partial);
  }

  @IsNotEmpty()
  id!: string;

  @IsNotEmpty()
  name!: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1, { message: 'Price must be greater than 0' })
  @IsInt()
  price!: number;

  @IsOptional()
  description?: string;

  @IsEnum(ProductCategory)
  @IsNotEmpty()
  category!: ProductCategory;

  @IsNotEmpty()
  seller!: UserDto;

  @IsArray()
  @IsString({ each: true })
  images!: ImageDto[];

  @IsOptional()
  deletedAt?: Date;
}
