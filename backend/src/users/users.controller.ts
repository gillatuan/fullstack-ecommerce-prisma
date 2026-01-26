import { Body, Controller, Post, Version } from '@nestjs/common';
import { CreateUserRequest } from './dto/create-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Version('1')
  @Post()
  create(@Body() createUserRequest: CreateUserRequest) {
    return this.usersService.createUser(createUserRequest);
  }

  /*   @Get('/me')
  me(@Current) {
    return this.usersService.getUser({email: ''})
  } */
  @Post('newsletter')
  createNewsletter(@Body() createUserRequest: CreateUserRequest) {
    return this.usersService.createNewsletter(createUserRequest);
  }
}
