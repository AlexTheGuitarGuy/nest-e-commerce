import { Exclude } from 'class-transformer';
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Role } from 'src/common/enums/role.enum';
import { PayerDto } from 'src/orders/dto/payer.dto';
import { ProductDto } from 'src/products/dto/product.dto';

export class UserDto {
  @IsNotEmpty()
  id!: number;

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

  payer?: PayerDto;

  @IsString()
  address!: string;
}
