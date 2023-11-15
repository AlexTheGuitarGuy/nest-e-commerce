import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { EmailConfirmationService } from './services/email-confirmation.service';
import { EmailConfirmationController } from './controllers/email-confirmation.controller';
import { EmailModule } from 'src/email/email.module';
import { EmailConfirmationGuard } from './guards/email-confirmation.guard';
import { APP_GUARD } from '@nestjs/core';

@Module({
  providers: [
    EmailConfirmationService,
    { provide: APP_GUARD, useClass: EmailConfirmationGuard },
  ],
  controllers: [EmailConfirmationController],
  imports: [UsersModule, EmailModule],
  exports: [EmailConfirmationService],
})
export class EmailConfirmationModule {}
