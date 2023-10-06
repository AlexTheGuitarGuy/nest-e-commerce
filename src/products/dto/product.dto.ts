import { IsEnum, IsNotEmpty } from 'class-validator';
import { ProductCategory } from 'src/common/enums/product-category.enum';
import { UserDto } from 'src/users/dto/user.dto';

export class ProductDto {
  @IsNotEmpty()
  id!: number;

  @IsNotEmpty()
  name!: string;

  @IsEnum(ProductCategory)
  @IsNotEmpty()
  category!: ProductCategory;

  @IsNotEmpty()
  seller!: UserDto;
}
