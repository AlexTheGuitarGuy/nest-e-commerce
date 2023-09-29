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
  HttpStatus,
  Request,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Request as RequestType } from 'supertest';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserDto } from '../dto/user.dto';
import { Observable, map } from 'rxjs';
import { Role } from 'src/enums/role.enum';
import { UpdateUserDto } from '../dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly _usersService: UsersService) {}

  @Post()
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
    if (req['user'].id !== id && req['user'].role !== Role.Admin) {
      if (req['user'].role !== Role.Admin) throw new ForbiddenException();
      else if (req['user'].id !== id) throw new UnauthorizedException();
    }

    return this._usersService.updateOne(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: RequestType) {
    if (req['user'].id !== id && req['user'].role !== Role.Admin) {
      if (req['user'].role !== Role.Admin) throw new ForbiddenException();
      else if (req['user'].id !== id) throw new UnauthorizedException();
    }

    return this._usersService.remove(id).pipe(
      map(() => {
        return { status: HttpStatus.OK };
      }),
    );
  }
}
