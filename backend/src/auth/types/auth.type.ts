import { RoleType } from 'generated/prisma/client';

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  password?: string;
  role?: RoleType;
  createdAt: Date;
  updatedAt: Date;
};

export interface TokenPayload {
  sub: string;
  email: string;
  permissions: string[];
  userId: string;
  roles?: string[];
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

export interface AuthLoginResponse extends Omit<AuthUser, 'password'> {
  roles: RoleType[];
  permissions: string[] | [];
}
