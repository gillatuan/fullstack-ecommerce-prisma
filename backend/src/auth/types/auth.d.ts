export type AuthUser = {
  id: number;
  name: string;
  email: string;
  password: string;
  roleId: number;
  createdAt: Date | null;
  updatedAt: Date | null;
};