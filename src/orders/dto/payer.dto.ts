import { IsNotEmpty, IsOptional } from 'class-validator';
import { UserDto } from 'src/users/dto/user.dto';

export class PayerDto {
  @IsNotEmpty()
  id!: number;

  @IsOptional()
  payerId?: string;

  @IsNotEmpty()
  user!: UserDto;
}
