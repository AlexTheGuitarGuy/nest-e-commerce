import { Role } from 'src/common/enums/role.enum';
import { ProductEntity } from 'src/products/entities/product.entity';
import {
  Column,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ default: false })
  isEmailConfirmed!: boolean;

  @Column({ unique: true })
  username!: string;

  @Column({ nullable: false })
  password!: string;

  @Column()
  role!: Role;

  @OneToMany(() => ProductEntity, (product) => product.seller)
  products!: ProductEntity[];

  @Column()
  address!: string;

  @DeleteDateColumn()
  deletedAt?: Date;
}
