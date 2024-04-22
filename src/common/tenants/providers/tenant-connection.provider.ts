import { InternalServerErrorException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Request } from 'express';

export const tenantConnectionProvider = {
  provide: 'TENANT_CONNECTION',
  useFactory: async (req: Request, connection: Connection) => {
    if (!req.tenantId)
      throw new InternalServerErrorException(
        'Make sure to apply tenant middleware',
      );
    return connection.useDb(`t_${req.tenantId}`);
  },
  inject: [REQUEST, getConnectionToken()],
};
