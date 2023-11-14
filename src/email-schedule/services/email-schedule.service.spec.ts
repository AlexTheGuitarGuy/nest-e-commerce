import { Test, TestingModule } from '@nestjs/testing';
import { EmailScheduleService } from './email-schedule.service';

describe('EmailScheduleService', () => {
  let service: EmailScheduleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailScheduleService],
    }).compile();

    service = module.get<EmailScheduleService>(EmailScheduleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
