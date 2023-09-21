import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';
import { firstValueFrom, map } from 'rxjs';
import { User } from 'src/users/users.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly _authService: AuthService) {
    super();
  }

  async validate(
    username: string,
    password: string,
  ): Promise<Pick<User, 'username' | 'id'>> {
    return await firstValueFrom(
      this._authService.validateUser(username, password).pipe(
        map((user) => {
          if (!user) throw new UnauthorizedException();

          return user;
        }),
      ),
    );
  }
}
