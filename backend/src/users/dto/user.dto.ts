import { IsEmail, IsOptional } from "class-validator";

export class UserResponse {
	@IsEmail()
	email: string;

	@IsOptional()
	roleId?: number;

	@IsOptional()
	createdAt?: Date | null;

	@IsOptional()
	updatedAt?: Date | null;
}
