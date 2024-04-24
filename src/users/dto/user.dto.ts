import { Exclude, Expose } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Role } from 'src/common/enums/role.enum';
import { ProductDto } from 'src/products/dto/product.dto';
import { UserEntity } from '../entities/user.entity';
import { randomUUID } from 'crypto';
import { ApiProperty } from '@nestjs/swagger';
import { PasswordField } from 'src/common/decorators/password-field.decorator';

type Fields = {
  [P in keyof UserEntity]: UserEntity[P];
};

@Expose()
export class UserDto implements Fields {
  constructor(partial: Partial<UserDto>) {
    Object.assign(this, partial);
  }

  @ApiProperty({
    example: randomUUID(),
  })
  @IsUUID()
  @IsNotEmpty()
  id!: string;

  @ApiProperty({
    example: 'test@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @Exclude()
  @PasswordField()
  password!: string;

  @ApiProperty({
    example: 'alex',
  })
  @IsString()
  @IsNotEmpty()
  username!: string;

  @ApiProperty()
  @IsEnum(Role)
  role!: Role;

  products!: ProductDto[];

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  address!: string;

  @ApiProperty()
  @IsNotEmpty()
  isEmailConfirmed!: boolean;

  @ApiProperty()
  @IsOptional()
  deletedAt?: Date;
}
