import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

import { EmailScheduleDto } from '../dto/email-schedule.dto';
import { EmailService } from 'src/email/services/email.service';

@Injectable()
export class EmailScheduleService {
  constructor(
    private readonly _emailService: EmailService,
    private readonly _schedulerRegistry: SchedulerRegistry,
  ) {}

  scheduleEmail(emailSchedule: EmailScheduleDto) {
    const date = new Date(emailSchedule.date);
    const job = new CronJob(date, () => {
      this._emailService.sendEmail({
        to: emailSchedule.recipient,
        subject: emailSchedule.subject,
        text: emailSchedule.content,
      });
    });

    this._schedulerRegistry.addCronJob(
      `${Date.now()}-${emailSchedule.subject}`,
      job as any,
    );
    job.start();
  }

  cancelAllScheduledEmails() {
    this._schedulerRegistry.getCronJobs().forEach((job) => {
      job.stop();
    });
  }
}
