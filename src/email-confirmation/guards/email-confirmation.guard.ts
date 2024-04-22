import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from 'src/auth/decorators/public.decorator';
import { EMAIL_CONFIRMATION_BYPASSED_KEY } from '../decorators/email-confirmation-bypassed.decorator';

@Injectable()
export class EmailConfirmationGuard implements CanActivate {
  constructor(private readonly _reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this._reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const emailConfirmationBypassed =
      this._reflector.getAllAndOverride<boolean>(
        EMAIL_CONFIRMATION_BYPASSED_KEY,
        [context.getHandler(), context.getClass()],
      );

    if (isPublic || emailConfirmationBypassed) return true;
    const req = context.switchToHttp().getRequest();

    if (!req.user?.isEmailConfirmed) {
      throw new ForbiddenException('Email not confirmed');
    }

    return true;
  }
}
