import { Module } from '@nestjs/common';

import { EmailModule } from 'src/email/email.module';
import { EmailScheduleService } from './services/email-schedule.service';
import { EmailScheduleController } from './controllers/email-schedule.controller';

@Module({
  providers: [EmailScheduleService],
  controllers: [EmailScheduleController],
  imports: [EmailModule],
})
export class EmailScheduleModule {}
