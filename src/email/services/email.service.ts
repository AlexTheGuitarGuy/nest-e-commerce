import { Injectable } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { from } from 'rxjs';

@Injectable()
export class EmailService {
  private nodemailerTransport: Mail;

  constructor() {
    this.nodemailerTransport = createTransport({
      host: process.env.EMAIL_SERVICE,
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  sendEmail(options: Mail.Options) {
    return from(this.nodemailerTransport.sendMail(options));
  }
}
