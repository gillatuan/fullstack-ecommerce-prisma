import { IsEmail, IsOptional } from "class-validator";

export class UserResponse {
	@IsEmail()
	email: string;

	@IsOptional()
	createdAt?: Date;

	@IsOptional()
	updatedAt?: Date
}
