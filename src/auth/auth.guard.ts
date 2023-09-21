import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Observable, catchError, from, map, of } from 'rxjs';
import { IS_PUBLIC_KEY } from 'src/decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly _jwtService: JwtService,
    private readonly _reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): Observable<boolean> {
    const isPublic = this._reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return of(true);

    const request = context.switchToHttp().getRequest();
    const token = this._extractFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    return from(
      this._jwtService.verifyAsync(token, { secret: process.env.JWT_SECRET }),
    ).pipe(
      catchError((_) => {
        throw new UnauthorizedException();
      }),
      map((payload) => {
        request['user'] = payload;
        return true;
      }),
    );
  }

  private _extractFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers['authorization']?.split(' ') ?? [];
    return type === 'Bearer' ? token : void 0;
  }
}
