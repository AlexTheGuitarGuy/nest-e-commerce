import { UserEntity } from 'src/users/entities/user.entity';
import {
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CartItemEntity } from './cart-item.entity';

@Entity()
export class CartEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(() => UserEntity)
  @JoinColumn()
  user!: UserEntity;

  @OneToMany(() => CartItemEntity, (cartItem) => cartItem.cart, {
    cascade: true,
  })
  cartItems!: CartItemEntity[];
}
