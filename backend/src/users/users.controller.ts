import {
  Body,
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  Version,
} from '@nestjs/common';
import { NoFilesInterceptor } from '@nestjs/platform-express';
import type { UserCreateInput } from './types/user.type';
import { UsersService } from './users.service';
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { PermissionGuard } from "rbac/permission.guard";
import { RequirePermissions } from "decorator/permissions.decorator";

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @RequirePermissions('user:create')
  @UseInterceptors(NoFilesInterceptor())
  create(@Body() createUserRequest: UserCreateInput) {
    return this.usersService.createUser(createUserRequest);
  }

  /*   @Get('/me')
  me(@Current) {
    return this.usersService.getUser({email: ''})
  } */
}
