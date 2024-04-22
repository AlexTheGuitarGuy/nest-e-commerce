import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable, map, concatMap, from } from 'rxjs';
import { UserDto } from 'src/users/dto/user.dto';
import { UsersService } from 'src/users/services/users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { plainToInstance } from 'class-transformer';
import { Response } from 'express';
import dayjs from 'dayjs';
import { RegisterDto } from '../dto/register.dto';
import { Role } from 'src/common/enums/role.enum';
import { UpdatePasswordDto } from '../dto/update-password.dto';
import { EmailConfirmationService } from 'src/email-confirmation/services/email-confirmation.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly _usersService: UsersService,
    private readonly _jwtService: JwtService,
    private readonly _emailConfirmationService: EmailConfirmationService,
  ) {}

  validateUser(username: string, password: string): Observable<UserDto | null> {
    return this._usersService
      .validate(username, password)
      .pipe(map((user) => plainToInstance(UserDto, user)));
  }

  login(user: UserDto, res: Response) {
    const payload = { ...user, sub: user.id, password: void 0 };
    const access_token = this._jwtService.sign(payload);

    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.DOPPLER_ENVIRONMENT === 'prod',
      sameSite: 'lax',
      expires: dayjs()
        .add(process.env.JWT_SESSION_DURATION, 'seconds')
        .toDate(),
    });

    return res;
  }

  register(data: RegisterDto) {
    const registeringUser = plainToInstance(CreateUserDto, {
      ...data,
      role: Role.Customer,
    });

    return this._usersService.createOneWithPassword(registeringUser).pipe(
      concatMap((user) =>
        this._emailConfirmationService
          .sendEmailConfirmationLink(
            user.email,
            process.env.EMAIL_CONFIRMATION_REDIRECT_URL,
          )
          .pipe(map(() => user)),
      ),
      map((user) => plainToInstance(UserDto, user)),
    );
  }

  sendResetPasswordEmail(user: UserDto, updatePasswordDto: UpdatePasswordDto) {
    return this._usersService
      .validate(user.username, updatePasswordDto.oldPassword)
      .pipe(
        map((user) => {
          if (!user) throw new BadRequestException('Invalid credentials');
          return user;
        }),
        concatMap((user) => {
          return from(bcrypt.hash(updatePasswordDto.newPassword, 10)).pipe(
            map((hashedPassword) => ({
              user,
              hashedPassword,
            })),
          );
        }),
        concatMap(({ user, hashedPassword }) =>
          this._emailConfirmationService.sendPasswordResetLink(
            user.email,
            hashedPassword,
            process.env.PASSWORD_RESET_REDIRECT_URL,
          ),
        ),
      );
  }
}
