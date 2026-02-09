import { IUser, flattenPermissions } from '@/users/types/user.type';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from 'decorator/permissions.decorator';
import { TokenPayload } from '@/auth/types/auth.type';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]) || [];

    if (requiredPermissions.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user as TokenPayload | IUser | any; // TokenPayload from JwtStrategy or full IUser from other flows

    if (!user) {
      // Nếu user undefined, chứng tỏ JwtAuthGuard chưa chạy hoặc token lỗi
      return false; 
    }

    // Kiểm tra SUPER_ADMIN (roles có thể là mảng string hoặc mảng mapping)
    const roleNames: string[] = Array.isArray(user.roles)
      ? user.roles
      : [];

    if (roleNames.includes('SUPER_ADMIN')) return true;

    // flatten permissions if necessary
    const userPermissions: string[] = Array.isArray(user.permissions)
      ? user.permissions
      : flattenPermissions(user);

    return requiredPermissions.every((p) => userPermissions.includes(p));
  }
}