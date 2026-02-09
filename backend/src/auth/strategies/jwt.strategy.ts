import { PrismaService } from '@/prisma/prisma.service';
import { flattenPermissions } from '@/users/types/user.type';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService, // Inject Prisma để lấy quyền mới nhất
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) =>
          request.cookies?.Authentication ||
          ExtractJwt.fromAuthHeaderAsBearerToken()(request),
      ]),
      secretOrKey: configService.getOrThrow('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    // Support tokens signed with `sub`, `userId` or legacy `id`
    const userId = payload?.sub || payload?.userId || payload?.id;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    });

    if (!user) throw new UnauthorizedException();

    const roleNames = (user.roles || []).map((ur) => ur.role?.name).filter(Boolean);
    const permissions = flattenPermissions(user);

    return {
      id: user.id,
      email: user.email,
      roles: roleNames,
      permissions,
    };
  }
}
