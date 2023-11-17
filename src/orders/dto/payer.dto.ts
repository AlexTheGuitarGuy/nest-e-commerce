import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserDto } from 'src/users/dto/user.dto';

export class PayerDto {
  @IsNotEmpty()
  id!: number;

  @IsOptional()
  @IsString()
  payerId?: string;

  @IsNotEmpty()
  user!: UserDto;
}
