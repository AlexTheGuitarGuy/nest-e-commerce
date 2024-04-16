import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { Role } from 'src/common/enums/role.enum';

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
  payerId?: string;

  @IsOptional()
  @IsString()
  address?: string;
}
