import { ProcessEnv as ProcessEnvType } from 'src/common/types/process-env.type';
import { UserDto } from 'src/users/dto/user.dto';

export declare global {
  namespace NodeJS {
    interface ProcessEnv extends ProcessEnvType {}
  }

  namespace Express {
    interface Request {
      tenantId?: string;
      user: UserDto;
    }
  }
}

declare module 'http' {
  interface IncomingHttpHeaders {
    'x-tenant-id'?: string;
  }
}
