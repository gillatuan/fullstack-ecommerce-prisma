import { UserGetPayload } from '@/users/types/user.type';
import { RoleType } from 'generated/prisma/client';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: RoleType | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export interface TokenPayload {
  sub: string;
  email: string;
  permissions: string[];
  userId: string;
  role: string | null;
}
export type RoleWithPermissions = {
  id: number;
  name: string;
  permissions: string[];
};

export type AuthLoginRequest = {
  email: string;
  password: string;
};

export interface AuthLoginResponse extends UserGetPayload {
  role: RoleType;
  permissions: string[] | [];
}
