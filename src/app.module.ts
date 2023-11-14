import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { RedisClientModule } from './redis-client/redis-client.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './core/database/database.module';
import { postgresConfig } from './core/database/postgres/postgres.config';
import { OrdersModule } from './orders/orders.module';
import { EmailModule } from './email/email.module';
import { ScheduleModule } from '@nestjs/schedule';
import { EmailScheduleModule } from './email-schedule/email-schedule.module';
import { EmailConfirmationModule } from './email-confirmation/email-confirmation.module';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [postgresConfig],
    }),
    AuthModule,
    UsersModule,
    ProductsModule,
    CartModule,
    RedisClientModule,
    OrdersModule,
    EmailModule,
    ScheduleModule.forRoot(),
    EmailScheduleModule,
    EmailConfirmationModule,
  ],
})
export class AppModule {}
