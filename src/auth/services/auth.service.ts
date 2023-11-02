import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable, map } from 'rxjs';
import { UserDto } from 'src/users/dto/user.dto';
import { UsersService } from 'src/users/services/users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class AuthService {
  constructor(
    private readonly _usersService: UsersService,
    private readonly _jwtService: JwtService,
  ) {}

  validateUser(username: string, password: string): Observable<UserDto | null> {
    return this._usersService
      .validate(username, password)
      .pipe(map((user) => plainToInstance(UserDto, user)));
  }

  login(user: UserDto) {
    const payload = { ...user, sub: user.id, password: void 0 };

    return { access_token: this._jwtService.sign(payload) };
  }

  register(data: CreateUserDto) {
    return this._usersService
      .create(data)
      .pipe(map((user) => plainToInstance(UserDto, user)));
  }
}
