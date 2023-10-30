import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ProductCategory } from 'src/common/enums/product-category.enum';
import { UserDto } from 'src/users/dto/user.dto';
import { ImageDto } from './image.dto';

export class UpdateProductDto {
  @IsOptional()
  name?: string;

  @IsNumber()
  @Min(1, { message: 'Quantity must be greater than 0' })
  price?: number;

  @IsOptional()
  @IsEnum(ProductCategory)
  category?: ProductCategory;

  @IsOptional()
  seller?: UserDto;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: ImageDto[];

  @IsOptional()
  description?: string;
}
