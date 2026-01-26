export interface SessionPayload {
userId: string;
email: string;
role: 'USER' | 'ADMIN';
iat: number;
exp: number;
}