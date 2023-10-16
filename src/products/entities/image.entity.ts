import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductEntity } from './product.entity';

@Entity()
export class ImageEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  url!: string;

  @Column({ nullable: true })
  name!: string;

  @ManyToOne(() => ProductEntity, (product) => product.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product?: ProductEntity;
}
