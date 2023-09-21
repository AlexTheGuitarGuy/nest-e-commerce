import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable, map, switchMap, from } from 'rxjs';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly _usersService: UsersService,
    private readonly _jwtService: JwtService,
  ) {}

  signIn(
    username: string,
    password: string,
  ): Observable<{ access_token: string }> {
    return this._usersService.findOneByUsername(username).pipe(
      switchMap((user) => {
        if (user.password !== password) throw new UnauthorizedException();
        const payload = { sub: user.id, username: user.name };
        return from(this._jwtService.signAsync(payload)).pipe(
          map((access_token) => ({ access_token })),
        );
      }),
    );
  }
}
