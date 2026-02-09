import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as argon2 from 'argon2';
import {
  mockUser,
  mockUserResponse,
  tokenPayload,
} from 'const/mock/common';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { RoleType } from "generated/prisma/enums";
import { ERRORS_DICTIONARY } from "const/constraint/error-dictionary";
import { JWT_AUTHENTICATION, JWT_EXPIRATION, JWT_SECRET } from "const/data";

jest.mock('argon2', () => ({
  hash: jest.fn(),
  verify: jest.fn(),
}));

describe('AuthService', () => {
  let authservice: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: { getUser: jest.fn() } },
        { provide: JwtService, useValue: { sign: jest.fn() } },
        { provide: ConfigService, useValue: { getOrThrow: jest.fn() } },
      ],
    }).compile();

    authservice = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Login', () => {
    it('should sign JWT token and set authentication cookie', async () => {
      const mockResponse = {
        cookie: jest.fn(),
      } as any;

      // ✅ mock config
      (configService.getOrThrow as jest.Mock).mockReturnValue(JWT_EXPIRATION);

      // ✅ mock jwt sign
      (jwtService.sign as jest.Mock).mockReturnValue(JWT_SECRET);

      // 👉 ACT
      const result = await authservice.login(mockUser, mockResponse);

      // 👉 ASSERT jwt sign
      expect(jwtService.sign).toHaveBeenCalledWith(tokenPayload);

      // 👉 ASSERT cookie
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        JWT_AUTHENTICATION,
        JWT_SECRET,
        expect.objectContaining({
          httpOnly: true,
          secure: true,
          expires: expect.any(Date),
        }),
      );

      // 👉 ASSERT return value
      expect(result).toEqual({
        tokenPayload
      });
    });
  });

  describe('verifyUser', () => {
    it('should return user if credentials are valid', async () => {
      (usersService.getUser as jest.Mock).mockResolvedValue(mockUserResponse);
      (argon2.verify as jest.Mock).mockResolvedValue(true);

      const result = await authservice.verifyUser(
        mockUser.email,
        'Admin@3010',
      );
      expect(usersService.getUser).toHaveBeenCalledWith({ email: mockUser.email });
      expect(argon2.verify).toHaveBeenCalledWith(
        'hashedpassword',
        'Admin@3010',
      );

      expect(result).toMatchObject({
        email: mockUser.email,
        role: RoleType.ADMIN,
        permissions: ['post:create'],
      });

    });

    it('should throw UnauthorizedException if user not found', async () => {
      (usersService.getUser as jest.Mock).mockResolvedValue(null);

      await expect(
        authservice.verifyUser('notfound@example.com', 'hashedpassword'),
      ).rejects.toThrow(ERRORS_DICTIONARY.EMAIL_NOT_EXISTED);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      (usersService.getUser as jest.Mock).mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      await expect(
        authservice.verifyUser(mockUser.email, 'wrongpassword'),
      ).rejects.toThrow(ERRORS_DICTIONARY.WRONG_CREDENTIALS);
    });
  });
});
