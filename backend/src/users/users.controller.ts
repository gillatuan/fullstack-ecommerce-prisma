import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateUserRequest } from './dto/create-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserRequest: CreateUserRequest) {
    return this.usersService.createUser(createUserRequest);
  }

/*   @Get('/me')
  me(@Current) {
    return this.usersService.getUser({email: ''})
  } */
}
