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
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { Request as RequestType } from 'supertest';
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
  create(@Body() createUserDto: CreateUserDto) {
    return this._usersService.create(createUserDto);
  }

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  findAll(): Observable<UserDto[]> {
    return this._usersService.findAll();
  }

  @Get('username')
  @UseInterceptors(ClassSerializerInterceptor)
  findOneByUsername(
    @Body() body: { username: string },
  ): Observable<UserDto | undefined> {
    console.log('username', body.username);

    return this._usersService.findOneByUsername(body.username);
  }

  @Get(':id')
  findOneById(@Param('id', ParseIntPipe) id: number): Observable<UserDto> {
    return this._usersService.findOneById(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: RequestType,
  ) {
    if (req['user'].id !== id && req['user'].role !== Role.Admin)
      throw new UnauthorizedException();

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
