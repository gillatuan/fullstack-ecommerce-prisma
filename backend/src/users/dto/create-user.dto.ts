import { IsEmail, IsOptional, IsStrongPassword } from 'class-validator';

export class CreateUserRequest {
  @IsEmail()
  email: string;

  @IsStrongPassword()
  password: string;
}
