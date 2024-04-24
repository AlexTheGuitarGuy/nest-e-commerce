import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { Public } from '../decorators/public.decorator';
import { map, tap } from 'rxjs';
import { EmailConfirmationBypassed } from 'src/email-confirmation/decorators/email-confirmation-bypassed.decorator';
import { RegisterDto } from '../dto/register.dto';
import { UpdatePasswordDto } from '../dto/update-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly _authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Public()
  @Post('login')
  login(@Req() req: Request, @Res() res: Response) {
    this._authService.login(req.user, res);
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
      tap((user) => {
        this._authService.login(user, res);
        res.send({ message: 'Registration successful' });
      }),
    );
  }

  @Patch('password')
  updatePassword(
    @Body() updatePasswordDto: UpdatePasswordDto,
    @Req() req: Request,
  ) {
    return this._authService
      .sendResetPasswordEmail(req.user, updatePasswordDto)
      .pipe(
        map(() => ({
          message:
            'An email has been sent to your email address, please check it to reset your password.',
        })),
      );
  }

  @Get('profile')
  @EmailConfirmationBypassed()
  getProfile(@Req() req: Request) {
    return req.user;
  }
}
