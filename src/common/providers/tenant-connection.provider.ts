import { InternalServerErrorException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Request } from 'express';

export const tenantConnectionProvider = {
  provide: 'TENANT_CONNECTION',
  useFactory: async (request: Request, connection: Connection) => {
    if (!request.tenantId)
      throw new InternalServerErrorException(
        'Make sure to apply tenant middleware',
      );
    return connection.useDb(request.tenantId);
  },
  inject: [REQUEST, getConnectionToken()],
};
