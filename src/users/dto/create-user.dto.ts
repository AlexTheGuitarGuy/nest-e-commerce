import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Role } from 'src/common/enums/role.enum';

export class CreateUserDto {
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
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

  @IsNotEmpty()
  @IsString()
  username!: string;

  @IsEnum(Role)
  role!: Role;

  @IsNotEmpty()
  @IsString()
  address!: string;
}
