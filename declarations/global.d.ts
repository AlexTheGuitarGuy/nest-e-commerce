import { ProcessEnv as ProcessEnvType } from 'src/common/types/process-env.type';

export declare global {
  namespace NodeJS {
    type ProcessEnv = ProcessEnvType;
  }

  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}
