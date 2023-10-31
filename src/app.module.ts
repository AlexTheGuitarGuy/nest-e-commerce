import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { RedisClientModule } from './redis-client/redis-client.module';
import { MongodbClientModule } from './mongodb-client/mongodb-client.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './core/database/database.module';
import { postgresConfig } from './core/database/postgres/postgres.config';
import { OrdersModule } from './orders/orders.module';

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
    MongodbClientModule,
    OrdersModule,
  ],
})
export class AppModule {}
