import { ProductEntity } from 'src/products/entities/product.entity';
import {
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
  quantity!: number;
}
