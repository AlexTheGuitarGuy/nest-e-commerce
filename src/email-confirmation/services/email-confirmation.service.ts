import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import dayjs from 'dayjs';
import { Response } from 'express';

import { EmailService } from 'src/email/services/email.service';
import { VerificationTokenPayload } from '../interfaces/verification-token-payload';
import { UserDto } from 'src/users/dto/user.dto';
import { UsersService } from 'src/users/services/users.service';

@Injectable()
export class EmailConfirmationService {
  constructor(
    private readonly _emailService: EmailService,
    private readonly _jwtService: JwtService,
    private readonly _userService: UsersService,
  ) {}

  sendEmailConfirmationLink(email: string, redirectUrl: string) {
    const payload: VerificationTokenPayload = { email };

    const token = this._jwtService.sign(payload, {
      secret: process.env.JWT_VERIFICATION_TOKEN_SECRET,
      expiresIn: `${process.env.JWT_VERIFICATION_TOKEN_EXPIRATION_TIME}s`,
    });

    const url = `${redirectUrl}?token=${token}`;

    const text = `Verify your email by clicking on the link: ${url}`;

    return this._emailService.sendEmail({
      to: email,
      subject: 'Verify your email',
      text,
    });
  }

  resendEmailConfirmationLink(user: UserDto) {
    if (user.isEmailConfirmed) {
      throw new BadRequestException('Email already confirmed');
    }

    return this.sendEmailConfirmationLink(
      user.email,
      process.env.EMAIL_CONFIRMATION_REDIRECT_URL || '',
    );
  }

  decodeEmailConfirmationToken(token: string) {
    try {
      const payload = this._jwtService.verify(token, {
        secret: process.env.JWT_VERIFICATION_TOKEN_SECRET,
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

  confirmEmail(email: string) {
    return this._userService.markEmailAsConfirmed(email);
  }

  sendPasswordResetLink(
    email: string,
    newPassword: string,
    redirectUrl: string,
  ) {
    const payload = { hashedPassword: newPassword };

    const token = this._jwtService.sign(payload, {
      secret: process.env.JWT_PASSWORD_RESET_TOKEN_SECRET,
      expiresIn: `${process.env.JWT_PASSWORD_RESET_TOKEN_EXPIRATION_TIME}s`,
    });

    const text = `To reset your password, click on the link: ${redirectUrl}?token=${token}`;

    return this._emailService.sendEmail({
      to: email,
      subject: 'Password reset',
      text,
    });
  }

  decodePasswordResetToken(token: string) {
    try {
      const payload = this._jwtService.verify(token, {
        secret: process.env.JWT_PASSWORD_RESET_TOKEN_SECRET,
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

  sendPaypalOrderEmail(
    user: UserDto,
    shouldContinue: boolean,
    paymentId?: string,
    payerId?: string,
  ) {
    if (!shouldContinue) {
      return this._emailService.sendEmail({
        to: user.email,
        subject: 'Payment cancelation',
        text: `Your payment has been cancelled.`,
      });
    }

    const payload = { paymentId, payerId };

    const token = this._jwtService.sign(payload, {
      secret: process.env.JWT_PAYPAL_ORDER_TOKEN_SECRET,
      expiresIn: `${process.env.JWT_PAYPAL_ORDER_TOKEN_EXPIRATION_TIME}s`,
    });

    const confirmUrl = `${process.env.PAYPAL_CONFIRM_URL}?token=${token}`;
    const cancelUrl = `${process.env.PAYPAL_CANCEL_URL}?token=${token}`;

    const text = `Please confirm your payment before proceeding.\n
      If you have already confirmed your payment, please ignore this email.\n
      Payment ID: ${paymentId}\n
      Payer ID: ${payerId}\n
      Click on the link to confirm your payment: ${confirmUrl}\n
      Click on the link to cancel your payment: ${cancelUrl}\n
      `;

    return this._emailService.sendEmail({
      to: user.email,
      subject: 'Payment confirmation',
      text,
    });
  }

  decodePaypalOrderToken(token: string) {
    try {
      const payload = this._jwtService.verify(token, {
        secret: process.env.JWT_PAYPAL_ORDER_TOKEN_SECRET,
      });

      if ('paymentId' in payload && 'payerId' in payload) {
        return payload;
      }
      throw new BadRequestException();
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new BadRequestException('Paypal order token expired');
      }
      throw new BadRequestException('Bad paypal order token');
    }
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
        .add(process.env.JWT_SESSION_DURATION, 'seconds')
        .toDate(),
    });
  }
}
