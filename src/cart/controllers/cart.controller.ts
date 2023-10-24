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
import { AddToCartDto } from '../dto/add-to-cart.dto';
import { UserDto } from 'src/users/dto/user.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { UsersService } from 'src/users/services/users.service';
import { switchMap, map, Observable } from 'rxjs';

@Controller('cart')
export class CartController {
  constructor(
    private readonly _cartService: CartService,
    private readonly _usersService: UsersService,
  ) {}

  private _addToCart(
    userId: number,
    addToCartDto: AddToCartDto,
  ): Observable<{ status: HttpStatus }> {
    return this._cartService
      .addToCart(userId, addToCartDto.productId, addToCartDto.quantity)
      .pipe(map(() => ({ status: HttpStatus.CREATED })));
  }

  @Post()
  addToCartCurrentUser(
    @Req() req: Request,
    @Body() addToCartDto: AddToCartDto,
  ) {
    const userId = (req['user'] as UserDto).id;
    return this._addToCart(userId, addToCartDto);
  }

  @Post(':userId')
  @Roles(Role.Admin)
  addToCartAdmin(
    @Param('userId') userId: number,
    @Body() addToCartDto: AddToCartDto,
  ) {
    return this._addToCart(userId, addToCartDto);
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
