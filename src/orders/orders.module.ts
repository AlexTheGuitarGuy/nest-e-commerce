import { Module } from '@nestjs/common';
import { OrdersService } from './services/orders.service';
import { CartModule } from 'src/cart/cart.module';
import * as paypal from 'paypal-rest-sdk';
import { environment } from 'src/environments/environment';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayerEntity } from './entities/payer.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  providers: [OrdersService],
  imports: [CartModule, UsersModule, TypeOrmModule.forFeature([PayerEntity])],
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
