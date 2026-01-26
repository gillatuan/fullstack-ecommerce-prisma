import { JWTPayload } from "jose";

export enum UserRole { 'ADMIN', 'USER' }

export interface SessionPayload extends JWTPayload {
  userId: string;
  email: string;
  role: UserRole.ADMIN | UserRole.USER;
  iat?: number;
  exp?: number;
}

export type LoginFormState = {
  error?: {
    email?: string;
    password?: string;
  };
  message?: string
  data?: JWTPayload | null;
};
