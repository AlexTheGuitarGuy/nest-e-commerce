import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  UseInterceptors,
  Param,
  Patch,
  ParseIntPipe,
  Delete,
  NotFoundException,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserDto } from '../dto/user.dto';
import { Observable, map } from 'rxjs';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { UpdateUserDto } from '../dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly _usersService: UsersService) {}

  @Post()
  @Roles(Role.Admin)
  create(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    return this._usersService.create(createUserDto);
  }

  @Get()
  @Roles(Role.Customer, Role.Admin)
  @UseInterceptors(ClassSerializerInterceptor)
  findAll(): Observable<UserDto[]> {
    return this._usersService.findAll();
  }

  @Get('username')
  @Roles(Role.Customer, Role.Admin)
  @UseInterceptors(ClassSerializerInterceptor)
  findOneByUsername(
    @Body() body: { username: string },
  ): Observable<UserDto | undefined> {
    console.log('username', body.username);

    return this._usersService.findOneByUsername(body.username);
  }

  @Patch(':id')
  @Roles(Role.Customer, Role.Admin)
  @UseInterceptors(ClassSerializerInterceptor)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this._usersService.updateOne(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this._usersService.remove(id).pipe(
      map((deleted) => {
        if (deleted.affected === 0) {
          throw new NotFoundException(`User with id ${id} not found`);
        }
        return HttpStatus.OK;
      }),
    );
  }
}
