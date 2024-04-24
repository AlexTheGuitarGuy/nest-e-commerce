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
  confirmEmail(@Query('token') token: string, @Res() res: Response) {
    const email: string =
      this._emailConfirmationService.decodeEmailConfirmationToken(token);
    return this._emailConfirmationService.confirmEmail(email).pipe(
      map((user) => plainToInstance(UserDto, user)),
      map((user) => {
        this._emailConfirmationService.updateUserJwt(user, res);
        res.send(user);
      }),
    );
  }

  @Post('resend-email-confirmation-link')
  @EmailConfirmationBypassed()
  resendEmailConfirmationLink(@Req() req: Request) {
    return this._emailConfirmationService
      .resendEmailConfirmationLink(req.user)
      .pipe(
        map(() => ({
          message: `Verification link resent to ${req.user.email}`,
        })),
      );
  }

  @Post('password-reset-confirm')
  updatePassword(@Query('token') token: string, @Req() req: Request) {
    const hashedPassword =
      this._emailConfirmationService.decodePasswordResetToken(token);

    return this._usersService
      .updateOne({ where: { id: req.user.id } }, { password: hashedPassword })
      .pipe(
        map(() => ({
          message: 'Password updated successfully',
        })),
      );
  }
}
