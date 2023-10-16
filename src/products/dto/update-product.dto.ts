import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { ProductCategory } from 'src/common/enums/product-category.enum';
import { UserDto } from 'src/users/dto/user.dto';
import { ImageDto } from './image.dto';

export class UpdateProductDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  @IsEnum(ProductCategory)
  category?: ProductCategory;

  @IsOptional()
  seller?: UserDto;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: ImageDto[];
}
