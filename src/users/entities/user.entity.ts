import { Exclude } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { Role } from 'src/common/enums/role.enum';
import { PayerEntity } from 'src/orders/entities/payer.entity';
import { ProductEntity } from 'src/products/entities/product.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column({ unique: true })
  username!: string;

  @Column({ nullable: false })
  @Exclude()
  password!: string;

  @Column()
  role!: Role;

  @OneToMany(() => ProductEntity, (product) => product.seller)
  products!: ProductEntity[];

  @IsOptional()
  @OneToOne(() => PayerEntity, (payer) => payer.user)
  @JoinColumn({ name: 'payer_id' })
  payer?: PayerEntity;

  @Column()
  address!: string;
}
