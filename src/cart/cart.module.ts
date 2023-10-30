import { Module } from '@nestjs/common';
import { CartService } from './services/cart.service';
import { CartController } from './controllers/cart.controller';
import { CartEntity } from './entities/cart.entity';
import { CartItemEntity } from './entities/cart-item.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { ProductEntity } from 'src/products/entities/product.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { RedisClientModule } from 'src/redis-client/redis-client.module';
import { ProductsModule } from 'src/products/products.module';

@Module({
  providers: [CartService],
  controllers: [CartController],
  imports: [
    TypeOrmModule.forFeature([
      CartEntity,
      CartItemEntity,
      UserEntity,
      ProductEntity,
    ]),
    UsersModule,
    ProductsModule,
    RedisClientModule,
  ],
})
export class CartModule {}
