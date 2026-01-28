export enum UserRole {
  USER = 2,
  ADMIN = 1,
}

export interface TokenPayload {
  userId: number;
  roleId: UserRole;
}