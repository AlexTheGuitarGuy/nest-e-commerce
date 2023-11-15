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
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UserDto } from 'src/users/dto/user.dto';
import dayjs from 'dayjs';
import { EmailConfirmationService } from 'src/email-confirmation/services/email-confirmation.service';
import { concatMap, map } from 'rxjs';
import { environment } from 'src/environments/environment';

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
    const { access_token } = this._authService.login(req.user as UserDto);

    res
      .cookie('access_token', access_token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        expires: dayjs().add(1, 'day').toDate(),
      })
      .send({ message: 'Login successful' });
  }

  @Post('logout')
  logout(@Res() res: Response) {
    res.clearCookie('access_token').send({
      message: 'Logout successful',
    });
  }

  @Post('register')
  @Public()
  register(@Body() createUser: CreateUserDto, @Res() res: Response) {
    return this._authService.register(createUser).pipe(
      concatMap((user) =>
        this._emailConfirmationService
          .sendVerificationLink(
            user.email,
            environment.EMAIL_CONFIRMATION_REDIRECT_URL,
          )
          .pipe(map(() => user)),
      ),
      map((user) => {
        const { access_token } = this._authService.login(user);
        res.cookie('access_token', access_token, {
          httpOnly: true,
          secure: false,

          sameSite: 'lax',
          expires: dayjs().add(1, 'day').toDate(),
        });
        return res.send({ message: 'Registration successful' });
      }),
    );
  }

  @Get('profile')
  getProfile(@Req() req: Request) {
    return req.user;
  }
}
