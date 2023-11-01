import { Module } from '@nestjs/common';
import { OrdersService } from './services/orders.service';
import { OrdersController } from './controllers/orders.controller';
import { CartModule } from 'src/cart/cart.module';
import * as paypal from 'paypal-rest-sdk';
import { environment } from 'src/environments/environment';

@Module({
  providers: [OrdersService],
  controllers: [OrdersController],
  imports: [CartModule],
})
export class OrdersModule {
  constructor() {
    const paypalConfig = {
      mode: environment.PAYPAL_MODE,
      client_id: environment.PAYPAL_CLIENT_ID,

      client_secret: environment.PAYPAL_CLIENT_SECRET,
    };
    paypal.configure(paypalConfig);
  }
}
