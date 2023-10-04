import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { ProductCategory } from 'src/common/enums/product-category.enum';

export class UpdateProductDto {
  @IsOptional()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsEnum(ProductCategory)
  category?: ProductCategory;
}
