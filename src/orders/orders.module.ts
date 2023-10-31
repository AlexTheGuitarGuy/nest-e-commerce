import { Module } from '@nestjs/common';
import { OrdersService } from './services/orders.service';
import { OrdersController } from './controllers/orders.controller';
import { CartModule } from 'src/cart/cart.module';

@Module({
  providers: [OrdersService],
  controllers: [OrdersController],
  imports: [CartModule],
})
export class OrdersModule {}
