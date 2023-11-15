import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable, map } from 'rxjs';
import { UserDto } from 'src/users/dto/user.dto';
import { UsersService } from 'src/users/services/users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { plainToInstance } from 'class-transformer';
import { Response } from 'express';
import dayjs from 'dayjs';
import { environment } from 'src/environments/environment';

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

  login(user: UserDto, res: Response) {
    const payload = { ...user, sub: user.id, password: void 0 };
    const access_token = this._jwtService.sign(payload);

    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      expires: dayjs()
        .add(environment.JWT_SESSION_DURATION, 'seconds')
        .toDate(),
    });

    return res;
  }

  register(data: CreateUserDto) {
    return this._usersService
      .create(data)
      .pipe(map((user) => plainToInstance(UserDto, user)));
  }
}
