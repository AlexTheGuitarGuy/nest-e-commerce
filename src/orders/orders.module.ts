import { Module } from '@nestjs/common';
import { OrdersService } from './services/orders.service';
import { CartModule } from 'src/cart/cart.module';
import * as paypal from 'paypal-rest-sdk';
import { environment } from 'src/environments/environment';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayerEntity } from './entities/payer.entity';
import { UsersModule } from 'src/users/users.module';
import { OrdersController } from './controllers/orders.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from './entities/payment.schema';

@Module({
  providers: [OrdersService],
  controllers: [OrdersController],
  imports: [
    CartModule,
    UsersModule,
    TypeOrmModule.forFeature([PayerEntity]),
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),
  ],
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
