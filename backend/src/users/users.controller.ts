import {
  Body,
  Controller,
  Post,
  UseInterceptors,
  Version,
} from '@nestjs/common';
import { NoFilesInterceptor } from '@nestjs/platform-express';
import { CreateUserRequest } from './dto/create-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Version('1')
  @Post()
  @UseInterceptors(NoFilesInterceptor())
  create(@Body() createUserRequest: CreateUserRequest) {
    return this.usersService.createUser(createUserRequest);
  }

  /*   @Get('/me')
  me(@Current) {
    return this.usersService.getUser({email: ''})
  } */
}
