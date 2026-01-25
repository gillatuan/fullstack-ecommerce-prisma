import { Test, TestingModule } from '@nestjs/testing';
import { UsersLetterController } from './users_letter.controller';
import { UsersLetterService } from './users_letter.service';

describe('UsersLetterController', () => {
  let controller: UsersLetterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersLetterController],
      providers: [UsersLetterService],
    }).compile();

    controller = module.get<UsersLetterController>(UsersLetterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
