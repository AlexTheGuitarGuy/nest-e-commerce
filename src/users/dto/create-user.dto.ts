import { PickType } from '@nestjs/swagger';
import { PasswordField } from 'src/common/decorators/password-field.decorator';
import { UserDto } from './user.dto';

export class CreateUserDto extends PickType(UserDto, [
  'email',
  'username',
  'role',
  'address',
]) {
  @PasswordField()
  password!: string;
}
