import { Permission } from "@/roles/types/roles.type";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: RoleType;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export enum RoleType {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  MEMBER = "MEMBER"
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