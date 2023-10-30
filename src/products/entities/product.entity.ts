import { ProductCategory } from 'src/common/enums/product-category.enum';
import { UserEntity } from 'src/users/entities/user.entity';
import { ImageEntity } from './image.entity';
import {
  Check,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class ProductEntity {
  @PrimaryGeneratedColumn()
  id!: number;

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
  images?: ImageEntity[];
}
