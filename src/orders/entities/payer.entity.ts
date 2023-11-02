import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from 'src/users/entities/user.entity';

@Entity()
export class PayerEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  payerId!: string;

  @OneToOne(() => UserEntity, (user) => user.payer)
  user!: UserEntity;
}
