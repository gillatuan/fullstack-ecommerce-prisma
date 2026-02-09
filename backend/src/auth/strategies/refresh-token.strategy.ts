import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from "@nestjs/passport";
import { Request } from 'express';
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request?.cookies?.Refresh,
      ]),
      secretOrKey: configService.get('JWT_REFRESH_SECRET') || '',
      passReqToCallback: true, // Để lấy lại chuỗi token thô phục vụ kiểm tra
    });
  }

  validate(req: Request, payload: any) {
    const refreshToken = req.cookies?.Refresh;
    return { ...payload, refreshToken };
  }
}
