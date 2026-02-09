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
    const user = await this.prisma.user.findUnique({
      where: { id: payload.id },
      include: {
        roles: {
          include: { role: true },
        },
      },
    });

    if (!user) throw new UnauthorizedException();

    // Lấy danh sách Role name (để check SUPER_ADMIN)
    const roleNames = user.roles.map((ur) => ur.role.name);

    // Lấy danh sách Permission string (để check PermissionGuard)
    const dbUser = await this.prisma.user.findUnique({
      where: { id: payload.id },
    });

    return {
      id: user.id,
      email: user.email,
      roles: roleNames,
      permissions: flattenPermissions(dbUser),
    };
  }
}
