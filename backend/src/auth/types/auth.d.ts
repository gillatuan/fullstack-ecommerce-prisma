export type AuthUser = {
  id: number;
  name: string;
  email: string;
  password: string;
  createdAt: Date | null;
  updatedAt: Date | null;
};