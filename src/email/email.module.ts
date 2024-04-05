import { Module } from '@nestjs/common';
import { EmailService } from './services/email.service';
import { ConfigModule } from '@nestjs/config';
import Joi from '@hapi/joi';

@Module({
  providers: [EmailService],
  imports: [
    ConfigModule.forRoot(
      Joi.object({
        EMAIL_SERVICE: Joi.string().required(),
        EMAIL_USER: Joi.string().required(),
        EMAIL_PASS: Joi.string().required(),
      }).validate({
        EMAIL_SERVICE: process.env.EMAIL_SERVICE,
        EMAIL_USER: process.env.EMAIL_USER,
        EMAIL_PASS: process.env.EMAIL_PASS,
      }).value,
    ),
  ],
  exports: [EmailService],
})
export class EmailModule {}
