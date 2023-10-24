import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { CartService } from '../services/cart.service';
import { Request } from 'express';
import { UserDto } from 'src/users/dto/user.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { UsersService } from 'src/users/services/users.service';
import { switchMap, map, Observable } from 'rxjs';
import { UpdateCartDto } from '../dto/update-cart.dto';

@Controller('cart')
export class CartController {
  constructor(
    private readonly _cartService: CartService,
    private readonly _usersService: UsersService,
  ) {}

  private _updateCart(
    userId: number,
    updateCartDto: UpdateCartDto,
  ): Observable<{ status: HttpStatus }> {
    return this._cartService
      .updateCart(userId, updateCartDto.productId, updateCartDto.quantity)
      .pipe(map(() => ({ status: HttpStatus.CREATED })));
  }

  @Post()
  updateCartCurrentUser(
    @Req() req: Request,
    @Body() updateCartDto: UpdateCartDto,
  ) {
    const userId = (req['user'] as UserDto).id;
    return this._updateCart(userId, updateCartDto);
  }

  @Post(':userId')
  @Roles(Role.Admin)
  updateCartAdmin(
    @Param('userId') userId: number,
    @Body() updateCartDto: UpdateCartDto,
  ) {
    return this._updateCart(userId, updateCartDto);
  }

  @Get()
  getCurrentUserCart(@Req() req: Request) {
    const userId = (req['user'] as UserDto).id;
    return this._cartService.viewCart(userId);
  }

  @Get(':userId')
  @Roles(Role.Admin)
  getCartAdmin(@Param('userId') userId: number) {
    return this._usersService
      .findOneById(userId)
      .pipe(switchMap((user) => this._cartService.viewCart(user.id)));
  }
}
