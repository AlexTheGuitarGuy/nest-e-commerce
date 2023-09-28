import { Exclude } from 'class-transformer';
import { Role } from 'src/enums/role.enum';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  email!: string;

  @Column()
  username!: string;

  @Column({ nullable: false })
  @Exclude()
  password!: string;

  @Column()
  role!: Role;
}
