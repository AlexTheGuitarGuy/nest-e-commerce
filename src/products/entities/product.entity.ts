import { ProductCategory } from 'src/common/enums/product-category.enum';
import { UserEntity } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ProductEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  name!: string;

  @Column()
  category!: ProductCategory;

  @ManyToOne(() => UserEntity, (user) => user.products)
  seller!: UserEntity;
}
