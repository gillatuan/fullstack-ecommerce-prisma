import { Permission } from "@/roles/types/roles.type";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  password: string;
  roleId: number;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export enum RoleType {
  SUPER_ADMIN,
  ADMIN,
  MEMBER
}

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
  permissions: Permission[];
};