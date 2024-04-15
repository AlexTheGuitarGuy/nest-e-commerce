import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Tenant } from './tenant.schema';
import { Model } from 'mongoose';

@Injectable()
export class TenantsService {
  constructor(
    @InjectModel(Tenant.name)
    private readonly _tenantModel: Model<Tenant>,
  ) {}

  async getTenantById(tenantId: string) {
    return this._tenantModel.findOne({ tenantId });
  }
}
