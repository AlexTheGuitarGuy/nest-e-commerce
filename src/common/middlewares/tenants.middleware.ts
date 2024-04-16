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
    const userId = req.cookies['user_id']?.toString();

    if (!userId) throw new BadRequestException('Tenant id is required');

    const tenantExists = await firstValueFrom(
      this._usersService.findOneById(userId),
    );
    if (!tenantExists) throw new BadRequestException('Tenant not found');

    req.userId = userId;
    next();
  }
}
