import { Test, TestingModule } from '@nestjs/testing';
import { mockUser, tokenPayload } from 'const/mock/common';
import { Response } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(AuthController);
    authService = module.get(AuthService);
  });

  it('should login user and return token payload', async () => {
    // ---------- ARRANGE ----------
    const mockResult = { tokenPayload };

    const req = {
      user: mockUser,
    };

    const res = {} as unknown as Response;

    authService.login.mockResolvedValue(mockResult);

    // ---------- ACT ----------
    const result = await controller.login(req.user, res);

    // ---------- ASSERT ----------
    expect(authService.login).toHaveBeenCalledWith(mockUser, res);
    expect(result).toEqual(mockResult);
  });
});
