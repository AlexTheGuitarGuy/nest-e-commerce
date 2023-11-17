import { Controller, Post, Query, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { EmailConfirmationService } from '../services/email-confirmation.service';
import { UserDto } from 'src/users/dto/user.dto';
import { map } from 'rxjs';
import { EmailConfirmationBypassed } from '../decorators/email-confirmation-bypassed.decorator';
import { plainToInstance } from 'class-transformer';
import { UsersService } from 'src/users/services/users.service';

@Controller('email-confirmation')
export class EmailConfirmationController {
  constructor(
    private readonly _emailConfirmationService: EmailConfirmationService,
    private readonly _usersService: UsersService,
  ) {}

  @Post('email-confirm')
  @EmailConfirmationBypassed()
  confirm(@Query('token') token: string, @Res() res: Response) {
    const email: string =
      this._emailConfirmationService.decodeConfirmationToken(token);
    return this._emailConfirmationService.confirmEmail(email).pipe(
      map((user) => plainToInstance(UserDto, user)),
      map((user) => {
        this._emailConfirmationService.updateUserJwt(user, res);
        res.send(user);
      }),
    );
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

  @Post('password-reset-confirm')
  updatePassword(@Query('token') token: string, @Req() req: Request) {
    const hashedPassword: string =
      this._emailConfirmationService.decodePasswordResetToken(token);
    const user = req.user as UserDto;
    return this._usersService.updatePassword(user.id, hashedPassword).pipe(
      map(() => ({
        message: 'Password updated successfully',
      })),
    );
  }
}
