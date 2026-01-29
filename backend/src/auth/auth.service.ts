import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ERRORS_DICTIONARY } from 'const/constraint/error-dictionary';
import { Response } from 'express';
import { User } from 'generated/prisma/client';
import ms from 'ms';
import { UsersService } from '../users/users.service';
import { TokenPayload } from './types/auth.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async login(user: User, response: Response) {
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
      userId: user.id,
      role: user.roleId,
    };
    const token = this.jwtService.sign(tokenPayload);

    response.cookie('Authentication', token, {
      secure: true,
      httpOnly: true,
      expires,
    });

    return { tokenPayload };
  }

  async verifyUser(email: string, password: string) {
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
      const authenticated = await bcrypt.compare(password, user.password);
      if (!authenticated) {
        throw new BadRequestException({
          message: ERRORS_DICTIONARY.WRONG_CREDENTIALS,
          details: 'Wrong credentials provided.',
        });
      }
      return user;
    } catch (err) {
      throw new BadRequestException({
        message: ERRORS_DICTIONARY.WRONG_CREDENTIALS,
        details: 'Wrong credentials provided.',
      });
    }
  }
}
