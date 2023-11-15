import { Body, Controller, Post } from '@nestjs/common';
import { EmailScheduleService } from '../services/email-schedule.service';
import { EmailScheduleDto } from '../dto/email-schedule.dto';

@Controller('email-schedule')
export class EmailScheduleController {
  constructor(private readonly _emailScheduleService: EmailScheduleService) {}

  @Post('schedule')
  scheduleEmail(@Body() emailSchedule: EmailScheduleDto) {
    this._emailScheduleService.scheduleEmail(emailSchedule);
  }
}
