import { IUser } from "@/users/types/user.type";
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from 'decorator/permissions.decorator';

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
    const user = request.user; // Dữ liệu này do JwtStrategy gán vào sau khi validate thành công

    if (!user) {
      // Nếu user undefined, chứng tỏ JwtAuthGuard chưa chạy hoặc token lỗi
      return false; 
    }

    // Kiểm tra SUPER_ADMIN (Dựa vào mảng role name đã flatten ở bước trên)
    if (user.roles?.includes('SUPER_ADMIN')) return true;

    const userPermissions: string[] = user.permissions || [];
    return requiredPermissions.every((p) => userPermissions.includes(p));
  }
}