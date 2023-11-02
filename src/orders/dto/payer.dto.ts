import { IsNotEmpty } from 'class-validator';
import { UserDto } from 'src/users/dto/user.dto';

export class PayerDto {
  @IsNotEmpty()
  id!: number;

  @IsNotEmpty()
  payerId!: string;

  @IsNotEmpty()
  user!: UserDto;
}
