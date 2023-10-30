import { IsNotEmpty } from 'class-validator';
import { UserDto } from 'src/users/dto/user.dto';
import { CartItemDto } from './cart-item.dto';

export class CartDto {
  @IsNotEmpty()
  user!: UserDto;

  @IsNotEmpty()
  cartItems!: CartItemDto[];
}
