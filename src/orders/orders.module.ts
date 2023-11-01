import { Module } from '@nestjs/common';
import { OrdersService } from './services/orders.service';
import { OrdersController } from './controllers/orders.controller';
import { CartModule } from 'src/cart/cart.module';
import * as paypal from 'paypal-rest-sdk';

@Module({
  providers: [OrdersService],
  controllers: [OrdersController],
  imports: [CartModule],
})
export class OrdersModule {
  constructor() {
    const paypalConfig = {
      mode: 'sandbox',
      client_id:
        'AdaoRoSVbU1D6ZzDPd3MyLJJAsYgWbtGrEHlBmEX5BhZQwoaofFB3UDOl1_dCHVYC8tQUA73BAhCOX_c',
      client_secret:
        'EMJzA4CzFlD6iENKD9nix6gzwb1S_znkriyUfm_Z4YyBPPIaW2uNjQmvplAOCYi-8mYR2MZ5jGYYww23',
    };
    console.log('paypalConfig', paypalConfig);

    paypal.configure(paypalConfig);
  }
}
