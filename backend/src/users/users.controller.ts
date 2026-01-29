import {
  Body,
  Controller,
  Post,
  UseInterceptors,
  Version,
} from '@nestjs/common';
import { NoFilesInterceptor } from '@nestjs/platform-express';
import type { UserCreateInput } from './types/user.type';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Version('1')
  @Post()
  @UseInterceptors(NoFilesInterceptor())
  create(@Body() createUserRequest: UserCreateInput) {
    return this.usersService.createUser(createUserRequest);
  }

  /*   @Get('/me')
  me(@Current) {
    return this.usersService.getUser({email: ''})
  } */
}
