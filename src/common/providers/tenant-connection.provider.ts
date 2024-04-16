import { InternalServerErrorException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Request } from 'express';

export const tenantConnectionProvider = {
  provide: 'TENANT_CONNECTION',
  useFactory: async (request: Request, connection: Connection) => {
    if (!request.userId)
      throw new InternalServerErrorException(
        'Make sure to apply tenant middleware',
      );
    return connection.useDb(`t_${request.userId}`);
  },
  inject: [REQUEST, getConnectionToken()],
};
