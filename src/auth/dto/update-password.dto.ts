import { PasswordField } from 'src/common/decorators/password-field.decorator';

export class UpdatePasswordDto {
  @PasswordField()
  oldPassword!: string;

  @PasswordField()
  newPassword!: string;
}
