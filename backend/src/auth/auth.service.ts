import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { ERRORS_DICTIONARY } from 'const/constraint/error-dictionary';
import { Response } from 'express';
import { RoleType } from 'generated/prisma/client';
import ms from 'ms';
import { UsersService } from '../users/users.service';
import { AuthLoginResponse, TokenPayload } from './types/auth.type';
import { PrismaService } from "@/prisma/prisma.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async getTokens(userId: string, email: string) {
    const payload = { id: userId, email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow('JWT_SECRET'),
        expiresIn: this.configService.getOrThrow('JWT_EXPIRATION'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.getOrThrow('JWT_REFRESH_TOKEN_EXPIRATION'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async setTokens(response: Response, refreshToken: string, token: string) {
    const expires = new Date();
    expires.setMilliseconds(
      expires.getMilliseconds() +
        ms(
          this.configService.getOrThrow<string>(
            'JWT_EXPIRATION',
          ) as unknown as ms.StringValue,
        ),
    );

    // Đặt Access Token vào cookie (ngắn hạn)
    // Đặt Refresh Token vào cookie (dài hạn)
    response.cookie('Refresh', refreshToken, {
      httpOnly: true,
      secure: true,
      path: '/api/v1/auth/refresh',
    });

    response.cookie('Authentication', token, {
      secure: true,
      httpOnly: true,
      expires,
    });
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    // Hash token trước khi lưu để bảo mật (tương tự password)
    const hashedRefreshToken = await argon2.hash(refreshToken);
    await this.usersService.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  async login(user: AuthLoginResponse, response: Response) {
    const { accessToken, refreshToken } = await this.getTokens(
      user.id,
      user.email,
    );
    await this.updateRefreshToken(user.id, refreshToken);

    const tokenPayload: TokenPayload = {
      sub: user.id,
      email: user.email,
      permissions: user.permissions,
      userId: user.id,
      roles: user.roles,
    };
    const token = this.jwtService.sign(tokenPayload);

    this.setTokens(response, refreshToken, token);

    return { tokenPayload };
  }

  async verifyUser(
    email: string,
    password: string,
  ): Promise<AuthLoginResponse> {
    // if not found, throw UnauthorizedException
    const user = await this.usersService.getUser({ email });
    if (!user) {
      throw new UnauthorizedException({
        message: ERRORS_DICTIONARY.EMAIL_NOT_EXISTED,
        details: 'Email does not exist.',
      });
    }

    // verify password
    const authenticated = await argon2.verify(user.password, password);
    if (!authenticated) {
      throw new BadRequestException({
        message: ERRORS_DICTIONARY.WRONG_CREDENTIALS,
        details: 'Wrong credentials provided.',
      });
    }

    // Get user Role
    const role = user.roles[0].role.name as RoleType;

    // Get user permissions
    const permissions = user.roles?.flatMap((userRole) =>
      userRole.role.permissions.map(
        (rolePermission) =>
          `${rolePermission.permission.resource}:${rolePermission.permission.action}`,
      ),
    );

    return {
      email: user.email,
      id: user.id,
      fullName: (user.fullName && user.fullName) || '',
      roles: [role],
      permissions,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  } // src/auth/auth.service.ts

  async refreshTokens(userId: string, refreshToken: string, res: Response) {
    const user = await this.usersService.findOne(userId);
    if (!user || !user.refreshToken) {
      throw new ForbiddenException({
        message: ERRORS_DICTIONARY.ACCESS_DENIED,
        details: 'Access denied.',
      });
    }

    // So sánh token gửi lên với token đã hash trong DB
    const refreshTokenMatches = await argon2.verify(
      user.refreshToken,
      refreshToken,
    );
    if (!refreshTokenMatches) {
      throw new ForbiddenException({
        message: ERRORS_DICTIONARY.ACCESS_DENIED,
        details: 'Access denied.',
      });
    }

    // Nếu khớp, tạo cặp token mới
    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    this.setTokens(res, tokens.refreshToken, tokens.accessToken);

    return res.send({ message: 'Làm mới token thành công' });
  }
}
