import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
  ValidationOptions,
} from 'class-validator';

export function PasswordField(
  validationOptions?: ValidationOptions,
  apiPropertyOptions?: ApiPropertyOptions,
) {
  return function (target: Object, propertyKey: string) {
    ApiProperty({ example: 'P@ssword12!', ...apiPropertyOptions })(
      target,
      propertyKey,
    );
    IsString()(target, propertyKey);
    IsNotEmpty()(target, propertyKey);
    MinLength(8, {
      message: 'The min length of password is 8',
      ...validationOptions,
    })(target, propertyKey);
    MaxLength(100, {
      message: "The password can't accept more than 100 characters",
      ...validationOptions,
    })(target, propertyKey);
    Matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d[\]{};:=<>_+^#$@!%*?&]{8,100}$/,
      {
        message:
          'A password contains at least one digit, one uppercase letter, and one lowercase letter',
        ...validationOptions,
      },
    )(target, propertyKey);
  };
}
