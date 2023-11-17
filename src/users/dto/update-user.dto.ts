import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { Role } from 'src/common/enums/role.enum';
import { PayerDto } from 'src/orders/dto/payer.dto';

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @IsOptional()
  payer?: PayerDto;

  @IsOptional()
  @IsString()
  address?: string;
}
