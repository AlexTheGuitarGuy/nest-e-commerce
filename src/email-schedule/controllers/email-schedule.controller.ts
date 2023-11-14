import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { EmailScheduleService } from '../services/email-schedule.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { EmailScheduleDto } from '../dto/email-schedule.dto';

@Controller('email-schedule')
export class EmailScheduleController {
  constructor(private readonly _emailScheduleService: EmailScheduleService) {}

  @Post('schedule')
  @UseGuards(JwtAuthGuard)
  scheduleEmail(@Body() emailSchedule: EmailScheduleDto) {
    this._emailScheduleService.scheduleEmail(emailSchedule);
  }
}
