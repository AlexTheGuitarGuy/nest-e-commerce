import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Body,
  Get,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from 'src/users/users.service';
import { Request as RequestType } from 'supertest';
import { Public } from 'src/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly _authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: Pick<User, 'password' | 'name'>) {
    return this._authService.signIn(signInDto.name, signInDto.password);
  }

  @Get('profile')
  getProfile(@Request() req: RequestType) {
    return req['user'];
  }
}
