export const NODE_ENV = [
  'local',
  'development',
  'staging',
  'production',
] as const;
export type NodeEnv = (typeof NODE_ENV)[number];

export interface ProcessEnv {
  CORS_ORIGIN: string;
  DOPPLER_CONFIG: string;
  DOPPLER_ENVIRONMENT: string;
  DOPPLER_PROJECT: string;
  EMAIL_CONFIRMATION_REDIRECT_URL: string;
  EMAIL_PASS: string;
  EMAIL_SERVICE: string;
  EMAIL_USER: string;
  JWT_PASSWORD_RESET_TOKEN_EXPIRATION_TIME: number;
  JWT_PASSWORD_RESET_TOKEN_SECRET: string;
  JWT_PAYPAL_ORDER_TOKEN_EXPIRATION_TIME: number;
  JWT_PAYPAL_ORDER_TOKEN_SECRET: string;
  JWT_SECRET: string;
  JWT_SESSION_DURATION: number;
  JWT_VERIFICATION_TOKEN_EXPIRATION_TIME: number;
  JWT_VERIFICATION_TOKEN_SECRET: string;
  MINIO_ACCESS_KEY: string;
  MINIO_ADMIN_PORT: number;
  MINIO_BUCKET_NAME: string;
  MINIO_ENDPOINT: string;
  MINIO_PORT: number;
  MINIO_SECRET_KEY: string;
  MONGODB_DB_NAME: string;
  MONGODB_URI: string;
  PASSWORD_RESET_REDIRECT_URL: string;
  PAYPAL_CANCEL_URL: string;
  PAYPAL_CLIENT_ID: string;
  PAYPAL_CLIENT_SECRET: string;
  PAYPAL_CONFIRM_URL: string;
  PAYPAL_MODE: string;
  PAYPAL_PAYMENT_REDIRECT_URL: string;
  PORT: number;
  POSTGRES_DB: string;
  POSTGRES_HOST: string;
  POSTGRES_PASSWORD: string;
  POSTGRES_PORT: number;
  POSTGRES_SCHEMA: string;
  POSTGRES_USER: string;
  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_PASSWORD: string;
}
