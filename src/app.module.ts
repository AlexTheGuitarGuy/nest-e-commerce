import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartModule } from './cart/cart.module';
import { RedisClientModule } from './redis-client/redis-client.module';
import { MongodbClientModule } from './mongodb-client/mongodb-client.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import postgres from './common/configs/postgres.config';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [postgres],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const postgresConfig = configService.get('postgres');
        if (!postgresConfig) throw new Error('Postgres config not found');
        return postgresConfig;
      },
    }),
    ProductsModule,
    CartModule,
    RedisClientModule,
    MongodbClientModule,
  ],
})
export class AppModule {}
