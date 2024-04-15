import { ProcessEnv as ProcessEnvType } from 'src/common/types/process-env.type';

export declare global {
  namespace NodeJS {
    type ProcessEnv = ProcessEnvType;
  }

  namespace Express {
    interface Request {
      tenantId?: string;
    }
  }
}

export declare module 'http' {
  interface IncomingHttpHeaders {
    'x-tenant-id'?: string;
  }
}
