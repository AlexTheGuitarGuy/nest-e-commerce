import { IsNotEmpty } from 'class-validator';
import { ProductCategory } from 'src/common/enums/product-category.enum';

export class ProductDto {
  @IsNotEmpty()
  id!: number;

  @IsNotEmpty()
  name!: string;

  category!: ProductCategory;
}
