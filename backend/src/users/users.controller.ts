import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import type { CreateUserRequest } from "./dto/create-user-request";

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  createUser(
    @Body() request: CreateUserRequest,
  ) {
    return this.usersService.createUser(request);
  }
}
