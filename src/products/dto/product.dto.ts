import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ProductCategory } from 'src/common/enums/product-category.enum';
import { UserDto } from 'src/users/dto/user.dto';
import { ImageDto } from './image.dto';

export class ProductDto {
  @IsNotEmpty()
  id!: number;

  @IsNotEmpty()
  name!: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1, { message: 'Price must be greater than 0' })
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
  @IsOptional()
  images?: ImageDto[];
}
