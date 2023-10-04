import { IsEnum, IsNotEmpty } from 'class-validator';
import { ProductCategory } from 'src/common/enums/product-category.enum';

export class CreateProductDto {
  @IsNotEmpty()
  name!: string;

  @IsEnum(ProductCategory)
  category!: ProductCategory;
}
