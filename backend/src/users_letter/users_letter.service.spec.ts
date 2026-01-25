import { Test, TestingModule } from '@nestjs/testing';
import { UsersLetterService } from './users_letter.service';

describe('UsersLetterService', () => {
  let service: UsersLetterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersLetterService],
    }).compile();

    service = module.get<UsersLetterService>(UsersLetterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
