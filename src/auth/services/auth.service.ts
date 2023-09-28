import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { UserDto } from 'src/users/dto/user.dto';
import { UsersService } from 'src/users/services/users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly _usersService: UsersService,
    private readonly _jwtService: JwtService,
  ) {}

  validateUser(username: string, password: string): Observable<UserDto | null> {
    return this._usersService.validate(username, password);
  }

  login(user: UserDto) {
    const payload = { ...user, sub: user.id, password: void 0 };

    return { access_token: `Bearer ${this._jwtService.sign(payload)}` };
  }

  register(data: CreateUserDto) {
    return this._usersService.create(data);
  }
}
