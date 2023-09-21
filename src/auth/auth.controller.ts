import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { Request as RequestType } from 'supertest';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { Role } from 'src/enums/role.enum';
import { Roles } from './decorators/roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly _authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Public()
  @Post('login')
  login(@Request() req: RequestType) {
    return this._authService.login(req['user']);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(Role.Admin)
  @Get('profile')
  getProfile(@Request() req: RequestType) {
    return req['user'];
  }
}
