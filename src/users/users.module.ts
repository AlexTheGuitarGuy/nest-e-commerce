import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { UserEntity } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController],
  imports: [TypeOrmModule.forFeature([UserEntity])],
})
export class UsersModule {}
