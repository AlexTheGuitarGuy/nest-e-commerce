import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class TenantIntegrityGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const user = context.switchToHttp().getRequest().user;
    const tenantId = context.switchToHttp().getRequest().headers['x-tenant-id'];

    if (!user || !tenantId)
      throw new BadRequestException('Missing user or tenantId');

    if (user.role !== 'admin' && user.id !== tenantId)
      throw new BadRequestException('Invalid user or tenantId');

    return true;
  }
}
