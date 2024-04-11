import { Module } from '@nestjs/common';
import { CartService } from './services/cart.service';
import { CartController } from './controllers/cart.controller';
import { UserEntity } from 'src/users/entities/user.entity';
import { ProductEntity } from 'src/products/entities/product.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { RedisClientModule } from 'src/core/database/redis-client/redis-client.module';
import { ProductsModule } from 'src/products/products.module';

@Module({
  providers: [CartService],
  controllers: [CartController],
  imports: [
    TypeOrmModule.forFeature([UserEntity, ProductEntity]),
    UsersModule,
    ProductsModule,
    RedisClientModule,
  ],
  exports: [CartService],
})
export class CartModule {}
