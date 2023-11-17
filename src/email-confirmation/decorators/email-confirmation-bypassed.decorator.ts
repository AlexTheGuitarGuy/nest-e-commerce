import { SetMetadata } from '@nestjs/common';

export const EMAIL_CONFIRMATION_BYPASSED_KEY = 'emailConfirmationBypassed';
export const EmailConfirmationBypassed = () =>
  SetMetadata(EMAIL_CONFIRMATION_BYPASSED_KEY, true);
