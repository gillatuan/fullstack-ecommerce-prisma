import { AuthUser, TokenPayload } from '@/auth/types/auth.type';

export const JWT_AUTHENTICATION =
  process.env.JWT_AUTHENTICATION || 'Authentication';
export const JWT_SECRET = process.env.JWT_SECRET || 'JWT_SECRET';
export const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '10h';

export const mockUser: AuthUser = {
  id: 'abc',
  name: 'testuser',
  email: 'logged-user@example.com',
  password: 'hashedpassword',
  role: 'MEMBER',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const tokenPayload: TokenPayload = {
  userId: mockUser.id,
  role: mockUser.role,
  sub: '',
  email: '',
  permissions: [],
};
