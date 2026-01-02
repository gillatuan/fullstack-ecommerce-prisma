export type User = {
  id?: string;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}


export interface AuthError {
  error: string;
}

export interface CreateUserResponse extends Omit<User, 'password'>, AuthError {}
