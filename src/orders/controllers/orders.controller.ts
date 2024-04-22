import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { map } from 'rxjs';
import { OrdersService } from '../services/orders.service';
import { EmailConfirmationService } from 'src/email-confirmation/services/email-confirmation.service';
import { TenantIntegrityGuard } from 'src/common/tenants/guards/tenant-integrity.guard';

@UseGuards(TenantIntegrityGuard)
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly _ordersService: OrdersService,
    private readonly _emailConfirmationService: EmailConfirmationService,
  ) {}

  @Post('create-payment')
  createPayment(@Req() req: Request) {
    return this._ordersService.createPayment(req.user);
  }

  @Post('send-payment-confirm-email')
  sendPaymentConfirmEmail(
    @Query('shouldContinue') shouldContinue: boolean,
    @Req() req: Request,
    @Query('paymentId') paymentId?: string,
    @Query('PayerID') payerId?: string,
  ) {
    return this._emailConfirmationService.sendPaypalOrderEmail(
      req.user,
      shouldContinue,
      paymentId,
      payerId,
    );
  }

  @Get('execute-payment')
  executePayment(@Query('token') token: string, @Req() req: Request) {
    return this._ordersService.executePayment(req.user, token).pipe(
      map(() => ({
        message: 'Payment executed successfully',
      })),
    );
  }

  @Delete('cancel-payment')
  cancelPayment(@Query('token') token: string, @Req() req: Request) {
    return this._ordersService.cancelPayment(req.user, token).pipe(
      map(() => ({
        message: 'Payment cancelled successfully',
      })),
    );
  }

  @Get('history')
  getOrderHistory() {
    return this._ordersService.getOrderHistory();
  }

  @Get('history/:payerId')
  getOrderHistoryByPayerId(@Param('payerId') payerId: string) {
    return this._ordersService.getOrderHistory(payerId);
  }
}
