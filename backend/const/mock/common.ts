import { AuthLoginResponse, TokenPayload } from '@/auth/types/auth.type';
import { UserGetPayload } from '@/users/types/user.type';
import { RoleType } from 'generated/prisma/enums';

export const mockUser: AuthLoginResponse = {
  id: 'abc',
  fullName: 'testuser',
  email: 'member_for_test@gmail.com',
  password: 'hashedpassword',
  role: RoleType.MEMBER,
  createdAt: new Date(),
  permissions: ['post:create'],
  roles: [],
};

export const tokenPayload: TokenPayload = {
  userId: mockUser.id,
  role: mockUser.role,
  sub: mockUser.id,
  email: mockUser.email,
  permissions: mockUser.permissions,
};

export const mockUserResponse: UserGetPayload = {
  id: mockUser.id,
  email: mockUser.email,
  password: mockUser.password,
  fullName: mockUser.fullName,
  createdAt: mockUser.createdAt,
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
