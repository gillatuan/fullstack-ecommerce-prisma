import { IsEmail, IsOptional, IsStrongPassword } from 'class-validator';

export class CreateUserRequest {
  @IsEmail()
  email: string;

  @IsStrongPassword()
  password: string;

  @IsOptional()
  roleId?: number = 2;
}
export class CreateNewsletterRequest {
  @IsEmail()
  email: string;

  @IsStrongPassword()
  password?: string;
}

