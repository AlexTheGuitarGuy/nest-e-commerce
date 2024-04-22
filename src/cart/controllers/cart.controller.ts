import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { UpdateCartDto } from '../dto/update-cart.dto';
import { CartService } from '../services/cart.service';
import { map } from 'rxjs';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';

@Controller('cart')
export class CartController {
  constructor(private readonly _cartService: CartService) {}

  @Get()
  getCartCurrentUser(@Req() req: Request) {
    return this._cartService.viewCart(req.user.id);
  }

  @Get(':userId')
  @Roles(Role.Admin)
  getCartAdmin(@Param('userId') userId: string) {
    return this._cartService.viewCart(userId);
  }

  @Post()
  updateCartCurrentUser(
    @Req() req: Request,
    @Body() updateCartDto: UpdateCartDto,
  ) {
    return this._cartService
      .updateCart(req.user.id, updateCartDto.productId, updateCartDto.quantity)
      .pipe(map(() => ({ message: 'Cart updated' })));
  }

  @Post(':userId')
  @Roles(Role.Admin)
  updateCartAdmin(
    @Param('userId') userId: string,
    @Body() updateCartDto: UpdateCartDto,
  ) {
    return this._cartService
      .updateCart(userId, updateCartDto.productId, updateCartDto.quantity)
      .pipe(map(() => ({ message: 'Cart updated' })));
  }

  @Delete('product/:productId')
  deleteProductFromCartCurrentUser(
    @Req() req: Request,
    @Param('productId') productId: string,
  ) {
    return this._cartService
      .deleteFromCart(req.user.id, productId)
      .pipe(map(() => ({ message: 'Cart updated' })));
  }

  @Delete('user/:userId/product/:productId')
  @Roles(Role.Admin)
  deleteProductFromCartAdmin(
    @Param('productId') productId: string,
    @Param('userId') userId: string,
  ) {
    return this._cartService
      .deleteFromCart(userId, productId)
      .pipe(map(() => ({ message: 'Cart updated' })));
  }

  @Delete()
  deleteCartCurrentUser(@Req() req: Request) {
    return this._cartService
      .deleteFromCart(req.user.id)
      .pipe(map(() => ({ message: 'Cart updated' })));
  }

  @Delete('user/:userId')
  @Roles(Role.Admin)
  deleteCartAdmin(@Param('userId') userId: string) {
    return this._cartService
      .deleteFromCart(userId)
      .pipe(map(() => ({ message: 'Cart updated' })));
  }
}
