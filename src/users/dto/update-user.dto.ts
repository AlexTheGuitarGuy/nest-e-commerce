import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Role } from 'src/enums/role.enum';

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email!: string;

  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'The min length of password is 8' })
  @MaxLength(100, {
    message: "The password can't accept more than 100 characters",
  })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d[\]{};:=<>_+^#$@!%*?&]{8,100}$/,
    {
      message:
        'A password contains at least one digit, one uppercase letter and one lowercase letter',
    },
  )
  password!: string;

  @IsString()
  @IsOptional()
  username!: string;

  @IsEnum(Role)
  @IsOptional()
  role!: Role;
}
