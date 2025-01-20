import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_FILTER } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { DatabaseModule } from './core/database/database.module';
import { postgresConfig } from './core/database/postgres/postgres.config';
import { OrdersModule } from './orders/orders.module';
import { EmailModule } from './email/email.module';
import { EmailScheduleModule } from './email-schedule/email-schedule.module';
import { EmailConfirmationModule } from './email-confirmation/email-confirmation.module';
import { QueryErrorFilter } from './common/filters/postgres-error.filter';

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
    OrdersModule,
    EmailModule,
    ScheduleModule.forRoot(),
    EmailScheduleModule,
    EmailConfirmationModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: QueryErrorFilter,
    },
  ],
})
export class AppModule {}
