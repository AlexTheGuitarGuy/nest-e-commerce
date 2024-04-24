import { Exclude, Expose } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Role } from 'src/common/enums/role.enum';
import { ProductDto } from 'src/products/dto/product.dto';
import { UserEntity } from '../entities/user.entity';
import { randomUUID } from 'crypto';
import { ApiProperty } from '@nestjs/swagger';

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

  @ApiProperty({
    example: 'P@ssword12!',
  })
  @IsString()
  @IsNotEmpty()
  @Exclude()
  @MinLength(8, { message: 'The min length of password is 8' })
  @MaxLength(100, {
    message: "The password can't accept more than 100 characters",
  })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d[\]{};:=<>_+^#$@!%*?&]{8,100}$/,
    {
      message:
        'A password contains at least one digit, one uppercase letter and one lowercase letter',
    },
  )
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
