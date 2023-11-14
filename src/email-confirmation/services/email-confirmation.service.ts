import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
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
}
