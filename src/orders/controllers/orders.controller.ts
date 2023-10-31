import { Controller, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { map } from 'rxjs';
import { OrdersService } from '../services/orders.service';
import { UserDto } from 'src/users/dto/user.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly _ordersService: OrdersService) {}

  @Post()
  placeOrder(@Req() req: Request) {
    const user = req['user'] as UserDto;
    return this._ordersService.placeOrder(user.id).pipe(
      map(() => ({
        message: 'Order placed successfully',
      })),
    );
  }
}
