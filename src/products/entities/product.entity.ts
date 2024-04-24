import { ProductCategory } from 'src/common/enums/product-category.enum';
import { UserEntity } from 'src/users/entities/user.entity';
import { ImageEntity } from './image.entity';
import {
  Check,
  Column,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class ProductEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  name!: string;

  @Column()
  @Check('price > 0')
  price!: number;

  @Column({ nullable: true })
  description?: string;

  @Column()
  category!: ProductCategory;

  @ManyToOne(() => UserEntity, (user) => user.products)
  seller!: UserEntity;

  @OneToMany(() => ImageEntity, (image) => image.product, { cascade: true })
  images!: ImageEntity[];

  @DeleteDateColumn()
  deletedAt?: Date;
}
