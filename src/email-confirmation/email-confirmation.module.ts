import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { EmailConfirmationService } from './services/email-confirmation.service';
import { EmailConfirmationController } from './controllers/email-confirmation.controller';
import { EmailModule } from 'src/email/email.module';

@Module({
  providers: [EmailConfirmationService],
  controllers: [EmailConfirmationController],
  imports: [UsersModule, EmailModule],
  exports: [EmailConfirmationService],
})
export class EmailConfirmationModule {}
