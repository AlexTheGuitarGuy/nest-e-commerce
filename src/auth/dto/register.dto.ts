import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { PasswordField } from 'src/common/decorators/password-field.decorator';

export class RegisterDto {
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @PasswordField()
  password!: string;

  @IsNotEmpty()
  @IsString()
  username!: string;

  @IsNotEmpty()
  @IsString()
  address!: string;
}
