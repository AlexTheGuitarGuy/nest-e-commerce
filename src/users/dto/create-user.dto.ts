import { PickType } from '@nestjs/swagger';
import { UserDto } from './user.dto';
import { PasswordField } from 'src/common/decorators/password-field.decorator';

export class CreateUserDto extends PickType(UserDto, [
  'email',
  'username',
  'role',
  'address',
]) {
  @PasswordField()
  password!: string;
}
