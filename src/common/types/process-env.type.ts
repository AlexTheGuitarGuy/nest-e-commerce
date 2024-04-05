export const NODE_ENV = [
  'local',
  'development',
  'staging',
  'production',
] as const;
export type NodeEnv = (typeof NODE_ENV)[number];

export interface ProcessEnv {
  CORS_ORIGIN: string;
  PORT_NUMBER: number;

  EMAIL_SERVICE: string;
  EMAIL_USER: string;
  EMAIL_PASS: string;
  EMAIL_CONFIRMATION_REDIRECT_URL: string;
  PASSWORD_RESET_REDIRECT_URL: string;

  REDIS_HOST: string;
  REDIS_PORT: number;

  PG_HOST: string;
  PG_PORT: number;
  PG_USERNAME: string;
  PG_PASSWORD: string;
  PG_DATABASE: string;

  MINIO_ENDPOINT: string;
  MINIO_PORT: number;
  MINIO_ACCESS_KEY: string;
  MINIO_SECRET_KEY: string;
  MINIO_BUCKET_NAME: string;

  MONGODB_URI: string;

  PAYPAL_MODE: string;
  PAYPAL_CLIENT_ID: string;
  PAYPAL_CLIENT_SECRET: string;
  PAYPAL_PAYMENT_REDIRECT_URL: string;

  JWT_SECRET: string;
  JWT_SESSION_DURATION: number;

  JWT_VERIFICATION_TOKEN_SECRET: string;
  JWT_VERIFICATION_TOKEN_EXPIRATION_TIME: number;

  JWT_PASSWORD_RESET_TOKEN_SECRET: string;
  JWT_PASSWORD_RESET_TOKEN_EXPIRATION_TIME: number;

  JWT_PAYPAL_ORDER_TOKEN_SECRET: string;
  JWT_PAYPAL_ORDER_TOKEN_EXPIRATION_TIME: number;

  PAYPAL_CONFIRM_URL: string;
  PAYPAL_CANCEL_URL: string;
}
