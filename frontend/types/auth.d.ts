export enum UserRole { 'ADMIN', 'USER' }

export interface SessionPayload {
  userId: string;
  email: string;
  roles: [UserRole.ADMIN | UserRole.USER];
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

export type SignupFormState = {
  error?: {
    name?: string;
    email?: string;
    password?: string;
  };
  message?: string
  data?: JWTPayload | null;
};
