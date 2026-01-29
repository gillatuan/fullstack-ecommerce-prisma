import { PrismaService } from "@/prisma/prisma.service";
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core/services";
import { PERMISSIONS_KEY } from "decorator/permissions.decorator";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions =
      this.reflector.get<string[]>(
        PERMISSIONS_KEY,
        context.getHandler(),
      );

    if (!requiredPermissions) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user; // từ JwtAuthGuard

    if (!user) return false;

    // Load permissions của role
    const role = await this.prisma.role.findUnique({
      where: { name: user.role },
      include: {
        permissions: true
      },
    });

    const userPermissions = role?.permissions.map(
      (rp) => rp.permissionId,
    );

    return requiredPermissions.every((p) =>
      userPermissions?.includes(+p),
    );
  }
}
