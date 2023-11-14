import { Module } from '@nestjs/common';
import { EmailService } from './services/email.service';
import { ConfigModule } from '@nestjs/config';
import Joi from '@hapi/joi';
import { environment } from 'src/environments/environment';

@Module({
  providers: [EmailService],
  imports: [
    ConfigModule.forRoot(
      Joi.object({
        EMAIL_SERVICE: Joi.string().required(),
        EMAIL_USER: Joi.string().required(),
        EMAIL_PASS: Joi.string().required(),
      }).validate({
        EMAIL_SERVICE: environment.EMAIL_SERVICE,
        EMAIL_USER: environment.EMAIL_USER,
        EMAIL_PASS: environment.EMAIL_PASS,
      }).value,
    ),
  ],
  exports: [EmailService],
})
export class EmailModule {}
