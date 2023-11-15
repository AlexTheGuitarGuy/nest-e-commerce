import { Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { concatMap, from, map } from 'rxjs';
import { OrdersService } from '../services/orders.service';
import { UserDto } from 'src/users/dto/user.dto';
import { Role } from 'src/common/enums/role.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UsersService } from 'src/users/services/users.service';
import { plainToInstance } from 'class-transformer';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly _ordersService: OrdersService,
    private readonly _usersService: UsersService,
  ) {}

  @Post('create-payment')
  createPayment(@Req() req: Request) {
    const user = req['user'] as UserDto;
    return this._ordersService.createPayment(user);
  }

  @Get('execute-payment')
  executePayment(
    @Query('paymentId') paymentId: string,
    @Query('PayerID') payerId: string,
    @Req() req: Request,
  ) {
    const user = req['user'] as UserDto;
    return this._ordersService.executePayment(user, paymentId, payerId);
  }

  @Get('cancel-payment')
  cancelPayment() {
    throw new Error('Method not implemented.');
  }

  @Get('history')
  getOrderHistory(@Req() req: Request) {
    const user = req['user'] as UserDto;
    return this._ordersService.getOrderHistory(user);
  }

  @Get('history/:userId')
  @Roles(Role.Admin)
  getOrderHistoryAdmin(@Param('userId') userId: number) {
    return from(this._usersService.findOneById(userId)).pipe(
      map((user) => plainToInstance(UserDto, user)),
      concatMap((user) => this._ordersService.getOrderHistory(user)),
    );
  }
}
