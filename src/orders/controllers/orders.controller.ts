import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { concatMap, from, map } from 'rxjs';
import { OrdersService } from '../services/orders.service';
import { UserDto } from 'src/users/dto/user.dto';
import { Role } from 'src/common/enums/role.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UsersService } from 'src/users/services/users.service';
import { plainToInstance } from 'class-transformer';
import { EmailConfirmationService } from 'src/email-confirmation/services/email-confirmation.service';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly _ordersService: OrdersService,
    private readonly _usersService: UsersService,
    private readonly _emailConfirmationService: EmailConfirmationService,
  ) {}

  @Post('create-payment')
  createPayment(@Req() req: Request) {
    const user = req['user'] as UserDto;
    return this._ordersService.createPayment(user);
  }

  @Post('send-payment-confirm-email')
  sendPaymentConfirmEmail(
    @Query('shouldContinue') shouldContinue: boolean,
    @Req() req: Request,
    @Query('paymentId') paymentId?: string,
    @Query('PayerID') payerId?: string,
  ) {
    const user = req['user'] as UserDto;
    return this._emailConfirmationService.sendPaypalOrderEmail(
      user,
      shouldContinue,
      paymentId,
      payerId,
    );
  }

  @Get('execute-payment')
  executePayment(@Query('token') token: string, @Req() req: Request) {
    const user = req['user'] as UserDto;
    return this._ordersService.executePayment(user, token).pipe(
      map(() => ({
        message: 'Payment executed successfully',
      })),
    );
  }

  @Delete('cancel-payment')
  cancelPayment(@Query('token') token: string, @Req() req: Request) {
    const user = req['user'] as UserDto;
    return this._ordersService.cancelPayment(user, token).pipe(
      map(() => ({
        message: 'Payment cancelled successfully',
      })),
    );
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
