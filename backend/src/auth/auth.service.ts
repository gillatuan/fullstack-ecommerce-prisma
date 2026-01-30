import {
  BadRequestException,
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

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async login(user: AuthLoginResponse, response: Response) {
    const expires = new Date();
    expires.setMilliseconds(
      expires.getMilliseconds() +
        ms(
          this.configService.getOrThrow<string>(
            'JWT_EXPIRATION',
          ) as unknown as ms.StringValue,
        ),
    );

    const tokenPayload: TokenPayload = {
      sub: user.id,
      email: user.email,
      permissions: user.permissions,
      userId: user.id,
      role: user.role,
    };

    const token = this.jwtService.sign(tokenPayload);

    response.cookie('Authentication', token, {
      secure: true,
      httpOnly: true,
      expires,
    });

    return { tokenPayload };
  }

  async verifyUser(
    email: string,
    password: string,
  ): Promise<AuthLoginResponse> {
    try {
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

      return { ...user, role, permissions };
    } catch (err) {
      throw new BadRequestException({
        message: ERRORS_DICTIONARY.WRONG_CREDENTIALS,
        details: 'Wrong credentials provided.',
      });
    }
  }
}
