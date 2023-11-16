import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { Public } from '../decorators/public.decorator';
import { UserDto } from 'src/users/dto/user.dto';
import { EmailConfirmationService } from 'src/email-confirmation/services/email-confirmation.service';
import { concatMap, map, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { EmailConfirmationBypassed } from 'src/email-confirmation/decorators/email-confirmation-bypassed.decorator';
import { RegisterDto } from '../dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly _authService: AuthService,
    private readonly _emailConfirmationService: EmailConfirmationService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Public()
  @Post('login')
  login(@Req() req: Request, @Res() res: Response) {
    this._authService.login(req.user as UserDto, res);

    res.send({ message: 'Login successful' });
  }

  @Post('logout')
  @EmailConfirmationBypassed()
  logout(@Res() res: Response) {
    res.clearCookie('access_token').send({
      message: 'Logout successful',
    });
  }

  @Post('register')
  @Public()
  register(@Body() createUser: RegisterDto, @Res() res: Response) {
    return this._authService.register(createUser).pipe(
      concatMap((user) =>
        this._emailConfirmationService
          .sendVerificationLink(
            user.email,
            environment.EMAIL_CONFIRMATION_REDIRECT_URL,
          )
          .pipe(map(() => user)),
      ),
      tap((user) => {
        this._authService.login(user, res);
        res.send({ message: 'Registration successful' });
      }),
    );
  }

  @Get('profile')
  @EmailConfirmationBypassed()
  getProfile(@Req() req: Request) {
    return req.user;
  }
}
