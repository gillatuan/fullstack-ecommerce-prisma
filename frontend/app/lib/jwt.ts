import jwt from 'jsonwebtoken';
import { SessionPayload } from '@/app/lib/session';

export function signSession(payload: SessionPayload) {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: '7d',
  });
}

export function verifySession(token: string): SessionPayload {
  return jwt.verify(token, process.env.JWT_SECRET!) as SessionPayload;
}