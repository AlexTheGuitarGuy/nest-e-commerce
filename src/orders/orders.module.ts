import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { OrdersService } from './services/orders.service';
import { CartModule } from 'src/cart/cart.module';
import * as paypal from 'paypal-rest-sdk';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayerEntity } from './entities/payer.entity';
import { UsersModule } from 'src/users/users.module';
import { OrdersController } from './controllers/orders.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from './entities/payment.schema';
import Joi from '@hapi/joi';
import { EmailModule } from 'src/email/email.module';
import { EmailConfirmationModule } from 'src/email-confirmation/email-confirmation.module';
import { TenantsMiddleware } from 'src/common/middlewares/tenants.middleware';
import { tenantModels } from 'src/common/providers/tenant-models.provider';
import { TenantsModule } from 'src/tenants/tenants.module';

@Module({
  providers: [OrdersService, tenantModels.paymentModel],
  controllers: [OrdersController],
  imports: [
    CartModule,
    UsersModule,
    TypeOrmModule.forFeature([PayerEntity]),
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),
    EmailModule,
    EmailConfirmationModule,
    TenantsModule,
  ],
})
export class OrdersModule implements NestModule {
  constructor() {
    const paypalConfig = Joi.object({
      mode: Joi.string().required(),
      client_id: Joi.string().required(),
      client_secret: Joi.string().required(),
    }).validate({
      mode: process.env.PAYPAL_MODE,
      client_id: process.env.PAYPAL_CLIENT_ID,
      client_secret: process.env.PAYPAL_CLIENT_SECRET,
    }).value;

    paypal.configure(paypalConfig);
  }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantsMiddleware).forRoutes(OrdersController);
  }
}
