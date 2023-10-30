import { IsEnum, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { ProductCategory } from 'src/common/enums/product-category.enum';

export class CreateProductDto {
  @IsNotEmpty()
  name!: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1, { message: 'Quantity must be greater than 0' })
  price!: number;

  @IsEnum(ProductCategory)
  @IsNotEmpty()
  category!: ProductCategory;

  @IsOptional()
  description?: string;
}
