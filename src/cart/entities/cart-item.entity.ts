import { ProductEntity } from 'src/products/entities/product.entity';
import {
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CartEntity } from './cart.entity';

@Entity()
export class CartItemEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => ProductEntity)
  @JoinColumn()
  product!: ProductEntity;

  @ManyToOne(() => CartEntity, (cart) => cart.cartItems)
  @JoinColumn()
  cart!: CartEntity;

  @Column()
  @Check('quantity > 0')
  quantity!: number;
}
