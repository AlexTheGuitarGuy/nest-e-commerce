import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Request as RequestType } from 'supertest';
import { AuthService } from '../services/auth.service';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Role } from 'src/enums/role.enum';
import { Roles } from '../decorators/roles.decorator';
import { Public } from '../decorators/public.decorator';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly _authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Public()
  @Post('login')
  login(@Request() req: RequestType) {
    return this._authService.login(req['user']);
  }

  @Post('register')
  register(@Body() user: CreateUserDto) {
    return this._authService.register(user);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(Role.Admin)
  @Get('profile')
  getProfile(@Request() req: RequestType) {
    return req['user'];
  }
}
