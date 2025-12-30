export type CreateUserRequest = {
  email: string;
  password: string;
  name?: string;
  createdAt?: Date;
  updatedAt?: Date;
};