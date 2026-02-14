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
import { PrismaService } from '@/prisma/prisma.service';
import { AuthService } from './auth.service';
import { RoleType } from "generated/prisma/enums";
import { ERRORS_DICTIONARY } from "const/constraint/error-dictionary";
import { JWT_AUTHENTICATION, JWT_EXPIRATION, JWT_SECRET } from "const/data";

jest.mock('argon2', () => ({
  hash: jest.fn(),
  verify: jest.fn(),
}));

jest.mock('ms', () => (str: string) => {
  if (str === '10h') return 36000000; // 10 hours
  if (str === '7d') return 604800000; // 7 days
  return 0;
});

describe('AuthService - Complete Auth Flow', () => {
  let authservice: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: {} },
        {
          provide: UsersService,
          useValue: {
            getUser: jest.fn(),
            update: jest.fn(),
            findOne: jest.fn(),
          },
        },
        { provide: JwtService, useValue: { signAsync: jest.fn() } },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn((key: string) => {
              if (key === 'JWT_SECRET') return JWT_SECRET;
              if (key === 'JWT_EXPIRATION') return JWT_EXPIRATION;
              if (key === 'JWT_REFRESH_SECRET') return JWT_SECRET;
              if (key === 'JWT_REFRESH_TOKEN_EXPIRATION') return '7d';
              return undefined;
            }),
          },
        },
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

  describe('getTokens - Token Generation', () => {
    it('should generate access and refresh tokens with correct expiration', async () => {
      const accessToken = 'eyJhbGc.token.access';
      const refreshToken = 'eyJhbGc.token.refresh';

      (jwtService.signAsync as jest.Mock)
        .mockResolvedValueOnce(accessToken)
        .mockResolvedValueOnce(refreshToken);

      const result = await authservice.getTokens(tokenPayload);

      // ✅ Both tokens generated
      expect(result).toEqual({ accessToken, refreshToken });
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);

      // ✅ Access token has full payload + expiration
      expect(jwtService.signAsync).toHaveBeenNthCalledWith(
        1,
        tokenPayload,
        expect.objectContaining({
          secret: JWT_SECRET,
          expiresIn: JWT_EXPIRATION,
        }),
      );

      // ✅ Refresh token has minimal payload + longer expiration
      expect(jwtService.signAsync).toHaveBeenNthCalledWith(
        2,
        { sub: tokenPayload.sub, email: tokenPayload.email },
        expect.objectContaining({
          secret: JWT_SECRET,
          expiresIn: '7d',
        }),
      );
    });
  });

  describe('setTokens - HttpOnly Cookie Management', () => {
    it('should set HttpOnly cookies with correct expiration times', async () => {
      const mockResponse = {
        cookie: jest.fn(),
      } as any;

      const accessToken = 'access-token-123';
      const refreshToken = 'refresh-token-456';

      await authservice.setTokens(mockResponse, refreshToken, accessToken);

      // ✅ Refresh cookie set (long-lived, path-restricted)
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'Refresh',
        refreshToken,
        expect.objectContaining({
          httpOnly: true,
          secure: true,
          path: '/api/v1/auth/refresh',
          expires: expect.any(Date),
        }),
      );

      // ✅ Authentication cookie set (short-lived)
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'Authentication',
        accessToken,
        expect.objectContaining({
          httpOnly: true,
          secure: true,
          expires: expect.any(Date),
        }),
      );
    });
  });

  describe('Login - Full Login Flow', () => {
    it('should complete full login: verify → token → cookie → return profile', async () => {
      const mockResponse = {
        cookie: jest.fn(),
      } as any;

      (jwtService.signAsync as jest.Mock)
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      (usersService.update as jest.Mock).mockResolvedValue({});

      const result = await authservice.login(mockUser, mockResponse);

      // ✅ Tokens generated
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);

      // ✅ Refresh token hashed and saved to DB
      expect(usersService.update).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          refreshToken: expect.any(String), // Hashed
        }),
      );

      // ✅ Verify argon2 hash called
      expect(argon2.hash).toHaveBeenCalledWith('refresh-token');

      // ✅ Cookies set
      expect(mockResponse.cookie).toHaveBeenCalledTimes(2);

      // ✅ Returns user profile (NOT tokens)
      expect(result).toEqual({
        user: expect.objectContaining({
          id: mockUser.id,
          email: mockUser.email,
          fullName: mockUser.fullName,
          roles: expect.any(Array),
          permissions: expect.any(Array),
        }),
      });

      // ✅ No tokens in response body
      expect(result.user).not.toHaveProperty('accessToken');
      expect(result.user).not.toHaveProperty('refreshToken');
    });
  });

  describe('verifyUser - Credential Verification', () => {
    it('should verify user credentials and return auth response', async () => {
      (usersService.getUser as jest.Mock).mockResolvedValue(mockUserResponse);
      (argon2.verify as jest.Mock).mockResolvedValue(true);

      const result = await authservice.verifyUser(mockUser.email, 'password');

      expect(usersService.getUser).toHaveBeenCalledWith({ email: mockUser.email });
      expect(argon2.verify).toHaveBeenCalledWith('hashedpassword', 'password');

      expect(result).toMatchObject({
        email: mockUser.email,
        roles: expect.any(Array),
        permissions: expect.any(Array),
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      (usersService.getUser as jest.Mock).mockResolvedValue(null);

      await expect(
        authservice.verifyUser('notfound@example.com', 'password'),
      ).rejects.toThrow(ERRORS_DICTIONARY.EMAIL_NOT_EXISTED);
    });

    it('should throw BadRequestException if password incorrect', async () => {
      (usersService.getUser as jest.Mock).mockResolvedValue(mockUserResponse);
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      await expect(
        authservice.verifyUser(mockUser.email, 'wrongpassword'),
      ).rejects.toThrow(ERRORS_DICTIONARY.WRONG_CREDENTIALS);
    });
  });

  describe('refreshTokens - Token Refresh Flow', () => {
    it('should validate refresh token and issue new token pair', async () => {
      const userId = 'user-123';
      const rawRefreshToken = 'refresh-token-raw';
      const hashedToken = 'hashed-refresh-token-from-db';

      const userWithRefreshToken = {
        ...mockUser,
        id: userId,
        refreshToken: hashedToken,
      };

      const mockResponse = {
        cookie: jest.fn(),
        send: jest.fn().mockReturnValue(mockUserResponse),
      } as any;

      (usersService.findOne as jest.Mock).mockResolvedValue(userWithRefreshToken);
      (argon2.verify as jest.Mock).mockResolvedValue(true);
      (jwtService.signAsync as jest.Mock)
        .mockResolvedValueOnce('new-access-token')
        .mockResolvedValueOnce('new-refresh-token');
      (usersService.update as jest.Mock).mockResolvedValue({});

      const result = await authservice.refreshTokens(
        userId,
        rawRefreshToken,
        mockResponse,
      );

      // ✅ User retrieved from DB
      expect(usersService.findOne).toHaveBeenCalledWith(userId);

      // ✅ Refresh token verified (hashed in DB vs raw token)
      expect(argon2.verify).toHaveBeenCalledWith(hashedToken, rawRefreshToken);

      // ✅ New tokens signed
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);

      // ✅ New refresh token hashed and saved
      expect(usersService.update).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          refreshToken: expect.any(String),
        }),
      );

      // ✅ New cookies set
      expect(mockResponse.cookie).toHaveBeenCalledTimes(2);
      expect(mockResponse.send).toHaveBeenCalledWith({
        message: 'Làm mới token thành công',
      });
    });

    it('should throw ForbiddenException if refresh token invalid', async () => {
      const userId = 'user-123';
      const invalidToken = 'invalid-refresh-token';

      const userWithRefreshToken = {
        ...mockUser,
        id: userId,
        refreshToken: 'correct-hashed-token',
      };

      const mockResponse = {} as any;

      (usersService.findOne as jest.Mock).mockResolvedValue(userWithRefreshToken);
      (argon2.verify as jest.Mock).mockResolvedValue(false); // Mismatch!

      await expect(
        authservice.refreshTokens(userId, invalidToken, mockResponse),
      ).rejects.toThrow(ERRORS_DICTIONARY.ACCESS_DENIED);

      // ✅ No new tokens signed on failure
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user not found for refresh', async () => {
      const mockResponse = {} as any;

      (usersService.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        authservice.refreshTokens('invalid-user', 'token', mockResponse),
      ).rejects.toThrow(ERRORS_DICTIONARY.ACCESS_DENIED);
    });

    it('should throw ForbiddenException if user has no refresh token stored', async () => {
      const userWithoutRefreshToken = {
        ...mockUser,
        refreshToken: null, // Not stored
      };

      const mockResponse = {} as any;

      (usersService.findOne as jest.Mock).mockResolvedValue(
        userWithoutRefreshToken,
      );

      await expect(
        authservice.refreshTokens(mockUser.id, 'token', mockResponse),
      ).rejects.toThrow(ERRORS_DICTIONARY.ACCESS_DENIED);
    });
  });
});
