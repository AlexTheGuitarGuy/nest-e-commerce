import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { OrdersService } from '../services/orders.service';
import { UserDto } from 'src/users/dto/user.dto';
import { CreatePaymentDto } from '../dto/create-payment.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly _ordersService: OrdersService) {}

  @Post('create-payment')
  createPayment(
    @Body() { returnUrl, cancelUrl }: CreatePaymentDto,
    @Req() req: Request,
  ) {
    const user = req['user'] as UserDto;
    return this._ordersService.createPayment(user, returnUrl, cancelUrl);
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

  @Get('history')
  getOrderHistory(@Req() req: Request) {
    const user = req['user'] as UserDto;
    return this._ordersService.getOrderHistory(user);
  }
}
