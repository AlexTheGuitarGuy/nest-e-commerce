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
  UnauthorizedException,
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
    return this._usersService.create(createUserDto);
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
  findOneByUsername(
    @Body() body: { username: string },
  ): Observable<UserDto | undefined> {
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
    @Req() req: Request,
  ) {
    if (
      (req.user as UserDto).id !== id &&
      (req.user as UserDto).role !== Role.Admin
    ) {
      if ((req.user as UserDto).role !== Role.Admin)
        throw new ForbiddenException();
      else if ((req.user as UserDto).id !== id)
        throw new UnauthorizedException();
    }

    return this._usersService.updateOne(id, updateUserDto);
  }

  @Delete(':id')
  removeOne(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    if (
      (req.user as UserDto).id !== id &&
      (req.user as UserDto).role !== Role.Admin
    ) {
      if ((req.user as UserDto).role !== Role.Admin)
        throw new ForbiddenException();
      else if ((req.user as UserDto).id !== id)
        throw new UnauthorizedException();
    }

    return this._usersService.removeOne(id).pipe(
      map(() => ({
        message: 'User deleted',
      })),
    );
  }
}
