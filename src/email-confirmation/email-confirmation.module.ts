import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { EmailModule } from 'src/email/email.module';
import { APP_GUARD } from '@nestjs/core';
import { EmailConfirmationService } from './services/email-confirmation.service';
import { EmailConfirmationController } from './controllers/email-confirmation.controller';
import { EmailConfirmationGuard } from './guards/email-confirmation.guard';

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
