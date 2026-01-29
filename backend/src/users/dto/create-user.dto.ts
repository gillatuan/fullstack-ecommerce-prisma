import { IsEmail, IsOptional, IsStrongPassword } from 'class-validator';

export class CreateUserRequest {
  @IsEmail()
  email: string;

  @IsStrongPassword()
  password: string;

  @IsOptional()
  roleId: number | null;
}
export class CreateNewsletterRequest {
  @IsEmail()
  email: string;

  @IsStrongPassword()
  password?: string;
}

