import { Exclude } from 'class-transformer';
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Role } from 'src/common/enums/role.enum';
import { ProductDto } from 'src/products/dto/product.dto';

export class UserDto {
  @IsNotEmpty()
  id!: string;

  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @Exclude()
  password!: string;

  @IsString()
  username!: string;

  @IsEnum(Role)
  role!: Role;

  products!: ProductDto[];

  @IsString()
  address!: string;

  @IsNotEmpty()
  isEmailConfirmed!: boolean;
}
