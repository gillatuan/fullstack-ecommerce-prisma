import { Prisma } from 'generated/prisma/client';

export type UserResponseType = Prisma.UserGetPayload<{
  select: typeof userPermissionSelect;
}>;

export type UserCreateInput = {
  name: string;
  email: string;
  password: string;
  roles?: string[];
  refreshToken?: string
};

export type UserGetPayload = Omit<
  Prisma.UserGetPayload<{
    include: {
      roles: {
        include: {
          role: { include: { permissions: { include: { permission: true } } } };
        };
      };
    };
  }>,
  'password'
>;

export interface IUser {
  id: string;
  email: string;
  fullName?: string;
  roles: string[];        // Ví dụ: ["ADMIN", "USER"]
  permissions: string[];  // Ví dụ: ["user:create", "role:update"]
}

export const userPermissionSelect = {
  id: true,
  email: true,
  fullName: true,
  refreshToken: true,
  roles: {
    select: {
      role: {
        select: {
          name: true,
          permissions: {
            select: {
              permission: {
                select: { action: true, resource: true }
              }
            }
          }
        }
      }
    }
  }
} satisfies Prisma.UserSelect;

export type UserWithPermissions = Prisma.UserGetPayload<{
  include: {
    roles: {
      include: {
        role: { include: { permissions: { include: { permission: true } } } };
      };
    };
  };
}>;

// Chuyển đổi dữ liệu Prisma thành mảng permission string: ["user:create", "role:read"]
export const flattenPermissions = (user: any): string[] => {
  const permissions = new Set<string>();
  user?.roles?.forEach((ur: any) => {
    ur.role?.permissions?.forEach((rp: any) => {
      const p = rp.permission;
      if (p) permissions.add(`${p.resource}:${p.action}`);
    });
  });
  return Array.from(permissions);
};