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
  Req,
  ForbiddenException,
  Query,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserDto } from '../dto/user.dto';
import { Observable, map } from 'rxjs';
import { UpdateUserDto } from '../dto/update-user.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { PageDto } from 'src/common/dto/page.dto';
import { plainToInstance } from 'class-transformer';
import { PageMetaDto } from 'src/common/dto/page-meta.dto';
import { PageOptionsDto } from 'src/common/dto/page-options-dto';

@Controller('users')
export class UsersController {
  constructor(private readonly _usersService: UsersService) {}

  @Post()
  @Roles(Role.Admin)
  create(@Body() createUserDto: CreateUserDto) {
    return this._usersService
      .create(createUserDto)
      .pipe(map((user) => plainToInstance(UserDto, user)));
  }

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  findAll(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Observable<PageDto<UserDto>> {
    const { take, skip } = pageOptionsDto;
    return this._usersService.findMany({}, {}, {}, take, skip).pipe(
      map(({ items, itemsCount }) => {
        const products = items.map((product) =>
          plainToInstance(UserDto, product),
        );

        return new PageDto(
          products,
          new PageMetaDto({ itemCount: itemsCount, pageOptionsDto }),
        );
      }),
    );
  }

  @Get('username')
  @UseInterceptors(ClassSerializerInterceptor)
  findOneByUsername(@Body() body: { username: string }): Observable<UserDto> {
    return this._usersService
      .findOneByUsername(body.username)
      .pipe(map((user) => plainToInstance(UserDto, user)));
  }

  @Get(':id')
  findOneById(@Param('id', ParseIntPipe) id: number): Observable<UserDto> {
    return this._usersService
      .findOneById(id)
      .pipe(map((user) => plainToInstance(UserDto, user)));
  }

  @Patch(':id')
  @Roles(Role.Admin)
  updateAdmin(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this._usersService
      .updateOne(id, updateUserDto)
      .pipe(map((user) => plainToInstance(UserDto, user)));
  }

  @Patch()
  update(@Body() updateUserDto: UpdateUserDto, @Req() req: Request) {
    const userId = req.user.id;
    return this._usersService
      .updateOne(userId, updateUserDto)
      .pipe(map((user) => plainToInstance(UserDto, user)));
  }

  @Delete(':id')
  removeOne(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    if (req.user.id !== id && req.user.role !== Role.Admin)
      throw new ForbiddenException();

    return this._usersService.removeOne(id).pipe(
      map(() => ({
        message: 'User deleted',
      })),
    );
  }
}
