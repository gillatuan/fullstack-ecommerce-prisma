import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import {
  JWT_AUTHENTICATION,
  JWT_EXPIRATION,
  JWT_SECRET,
  mockUser,
} from 'const/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let authservice: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let configService: ConfigService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: { user: { findUnique: jest.fn(), create: jest.fn() } },
        },
        { provide: UsersService, useValue: { getUser: jest.fn() } },
        { provide: JwtService, useValue: { sign: jest.fn() } },
        { provide: ConfigService, useValue: { getOrThrow: jest.fn() } },
      ],
    }).compile();

    authservice = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
    prismaService = module.get<PrismaService>(PrismaService);
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
      expect(jwtService.sign).toHaveBeenCalledWith({
        userId: mockUser.id,
        roleId: mockUser.roleId,
      });

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
        tokenPayload: { userId: mockUser.id, role: mockUser.roleId },
      });
    });
  });

  describe('verifyUser', () => {
    it('should return user if credentials are valid', async () => {
      (usersService.getUser as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authservice.verifyUser(
        mockUser.email,
        'hashedpassword',
      );
      expect(usersService.getUser).toHaveBeenCalledWith({
        email: mockUser.email,
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'hashedpassword',
        mockUser.password,
      );
      expect(result).toBe(mockUser);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      (usersService.getUser as jest.Mock).mockResolvedValue(null);

      await expect(
        authservice.verifyUser('notfound@example.com', 'hashedpassword'),
      ).rejects.toThrow('Credentials are not valid.');
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const mockUser = {
        email: 'test@example.com',
        password: 'hashedpassword',
      };

      (usersService.getUser as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authservice.verifyUser('test@example.com', 'wrongpassword'),
      ).rejects.toThrow('Credentials are not valid.');
    });
  });
});
