import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantsService } from 'src/tenants/tenants.service';

@Injectable()
export class TenantsMiddleware implements NestMiddleware {
  constructor(private tenantsService: TenantsService) {}

  async use(req: Request, _: Response, next: NextFunction) {
    const tenantId = req.headers['x-tenant-id']?.toString();

    if (!tenantId) throw new BadRequestException('Tenant id is required');

    const tenantExists = await this.tenantsService.getTenantById(tenantId);
    if (!tenantExists) throw new BadRequestException('Tenant not found');

    req.tenantId = tenantId;
    next();
  }
}
