import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { ProductCategory } from 'src/common/enums/product-category.enum';

export class CreateProductDto {
  @IsNotEmpty()
  name!: string;

  @IsEnum(ProductCategory)
  @IsNotEmpty()
  category!: ProductCategory;

  @IsOptional()
  description?: string;
}
