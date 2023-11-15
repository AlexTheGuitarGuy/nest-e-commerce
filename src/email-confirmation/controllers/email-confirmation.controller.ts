import { Controller, Post, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { EmailConfirmationService } from '../services/email-confirmation.service';
import { UserDto } from 'src/users/dto/user.dto';
import { map } from 'rxjs';
import { EmailConfirmationBypassed } from '../decorators/email-confirmation-bypassed.decorator';

@Controller('email-confirmation')
export class EmailConfirmationController {
  constructor(
    private readonly _emailConfirmationService: EmailConfirmationService,
  ) {}

  @Post('confirm')
  @EmailConfirmationBypassed()
  confirm(@Query('token') token: string) {
    const email = this._emailConfirmationService.decodeConfirmationToken(token);
    return this._emailConfirmationService.confirmEmail(email);
  }

  @Post('resend-confirmation-link')
  @EmailConfirmationBypassed()
  resendConfirmationLink(@Req() req: Request) {
    const user = req.user as UserDto;
    return this._emailConfirmationService.resendVerificationLink(user).pipe(
      map(() => ({
        message: `Verification link resent to ${user.email}`,
      })),
    );
  }
}
