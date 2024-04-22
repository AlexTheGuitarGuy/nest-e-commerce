import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { firstValueFrom } from 'rxjs';
import { UsersService } from 'src/users/services/users.service';

@Injectable()
export class TenantsMiddleware implements NestMiddleware {
  constructor(private readonly _usersService: UsersService) {}

  async use(req: Request, _: Response, next: NextFunction) {
    const userId = req.headers['x-tenant-id']?.toString();
    if (!userId) 
    throw new BadRequestException('X-TENANT-ID not provided');


    await firstValueFrom(
      this._usersService.findOneOrThrow({
        where: { id: userId },
      }),
    );
    req.tenantId = userId.toString();
    next();
  }
}
