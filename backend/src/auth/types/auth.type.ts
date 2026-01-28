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

export enum UserRole {
  USER = 2,
  ADMIN = 1,
}

export interface TokenPayload {
  userId: number;
  role: UserRole | null;
}
export type RoleWithPermissions = {
  id: number;
  name: string;
  permissions: Permission[];
};