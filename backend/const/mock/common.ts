import { AuthLoginResponse, TokenPayload } from '@/auth/types/auth.type';
import { UserGetPayload } from '@/users/types/user.type';
import { RoleType } from 'generated/prisma/enums';

export const mockUser: AuthLoginResponse = {
  id: 'abc',
  fullName: 'testuser',
  email: 'member_for_test@gmail.com',
  createdAt: new Date(),
  updatedAt: new Date(),
  permissions: ['post:create'],
  roles: [RoleType.MEMBER],
};

export const tokenPayload: TokenPayload = {
  userId: mockUser.id,
  roles: mockUser.roles || undefined,
  sub: mockUser.id,
  email: mockUser.email,
  permissions: mockUser.permissions,
};

export const mockUserResponse: UserGetPayload = {
  id: mockUser.id,
  email: mockUser.email,
  fullName: mockUser.fullName,
  createdAt: mockUser.createdAt,
  updatedAt: mockUser.updatedAt,
  refreshToken: '',
  roles: [
    {
      role: {
        id: '1',
        description: 'description',
        name: RoleType.ADMIN,
        permissions: [
          {
            permission: {
              id: '1',
              resource: 'post',
              action: 'create',
            },
            roleId: '1',
            permissionId: '1',
          },
        ],
      },
      userId: '1',
      roleId: '1',
    },
  ],
};
