import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import dayjs from 'dayjs';
import { Response } from 'express';

import { EmailService } from 'src/email/services/email.service';
import { VerificationTokenPayload } from '../interfaces/verification-token-payload';
import { UserDto } from 'src/users/dto/user.dto';
import { UsersService } from 'src/users/services/users.service';
import { environment } from 'src/environments/environment';

@Injectable()
export class EmailConfirmationService {
  constructor(
    private readonly _emailService: EmailService,
    private readonly _jwtService: JwtService,
    private readonly _userService: UsersService,
  ) {}

  sendVerificationLink(email: string, redirectUrl: string) {
    const payload: VerificationTokenPayload = { email };

    const token = this._jwtService.sign(payload, {
      secret: environment.JWT_VERIFICATION_TOKEN_SECRET,
      expiresIn: `${environment.JWT_VERIFICATION_TOKEN_EXPIRATION_TIME}s`,
    });

    const url = `${redirectUrl}?token=${token}`;

    const text = `Verify your email by clicking on the link: ${url}`;

    return this._emailService.sendEmail({
      to: email,
      subject: 'Verify your email',
      text,
    });
  }

  sendPasswordResetLink(
    email: string,
    newPassword: string,
    redirectUrl: string,
  ) {
    const payload = { hashedPassword: newPassword };

    const token = this._jwtService.sign(payload, {
      secret: environment.JWT_PASSWORD_RESET_TOKEN_SECRET,
      expiresIn: `${environment.JWT_PASSWORD_RESET_TOKEN_EXPIRATION_TIME}s`,
    });

    const text = `To reset your password, click on the link: ${redirectUrl}?token=${token}`;

    return this._emailService.sendEmail({
      to: email,
      subject: 'Password reset',
      text,
    });
  }

  resendVerificationLink(user: UserDto) {
    if (user.isEmailConfirmed) {
      throw new BadRequestException('Email already confirmed');
    }

    return this.sendVerificationLink(
      user.email,
      environment.EMAIL_CONFIRMATION_REDIRECT_URL || '',
    );
  }

  confirmEmail(email: string) {
    return this._userService.markEmailAsConfirmed(email);
  }

  updateUserJwt(user: UserDto, res: Response) {
    const payload = { ...user, sub: user.id, password: void 0 };
    const access_token = this._jwtService.sign(payload);
    res.clearCookie('access_token');

    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      expires: dayjs()
        .add(environment.JWT_SESSION_DURATION, 'seconds')
        .toDate(),
    });
  }

  decodeConfirmationToken(token: string) {
    try {
      const payload = this._jwtService.verify(token, {
        secret: environment.JWT_VERIFICATION_TOKEN_SECRET,
      });

      if ('email' in payload) {
        return payload.email;
      }
      throw new BadRequestException();
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new BadRequestException('Email confirmation token expired');
      }
      throw new BadRequestException('Bad email confirmation token');
    }
  }

  decodePasswordResetToken(token: string) {
    try {
      const payload = this._jwtService.verify(token, {
        secret: environment.JWT_PASSWORD_RESET_TOKEN_SECRET,
      });

      if ('hashedPassword' in payload) {
        return payload.hashedPassword;
      }
      throw new BadRequestException();
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new BadRequestException('Password reset token expired');
      }
      throw new BadRequestException('Bad password reset token');
    }
  }
}
