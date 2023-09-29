import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserDto } from 'src/users/dto/user.dto';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtStrategy.extractJWTFromCookie,
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env['JWT_SECRET'],
    });
  }

  private static extractJWTFromCookie(req: Request): string | null {
    if (!req.cookies?.access_token) return null;

    return req.cookies.access_token;
  }

  validate(payload: UserDto) {
    return { ...payload, sub: void 0, iat: void 0, exp: void 0 };
  }
}
