import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable, map } from 'rxjs';
import { User, UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly _usersService: UsersService,
    private readonly _jwtService: JwtService,
  ) {}

  validateUser(
    username: string,
    password: string,
  ): Observable<Omit<User, 'password'> | null> {
    return this._usersService.findOneByUsername(username).pipe(
      map((user) => {
        if (!user || user.password !== password) return null;
        const { password: pass, ...result } = user;

        return result;
      }),
    );
  }

  login(user: User) {
    const payload = { ...user, sub: user.id, password: void 0 };

    return { access_token: this._jwtService.sign(payload) };
  }
}
