import { Injectable } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { from } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable()
export class EmailService {
  private nodemailerTransport: Mail;

  constructor() {
    this.nodemailerTransport = createTransport({
      host: environment.EMAIL_SERVICE,
      port: 465,
      secure: true,
      auth: {
        user: environment.EMAIL_USER,
        pass: environment.EMAIL_PASS,
      },
    });
  }

  sendEmail(options: Mail.Options) {
    return from(this.nodemailerTransport.sendMail(options));
  }
}
