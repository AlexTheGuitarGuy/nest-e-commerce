import { Exclude } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Role } from 'src/enums/role.enum';

export class UserDto {
  @IsNotEmpty()
  @IsString()
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

  role!: Role;
}
