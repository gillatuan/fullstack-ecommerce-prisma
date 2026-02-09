import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { NoFilesInterceptor } from '@nestjs/platform-express';
import { RequirePermissions } from 'decorator/permissions.decorator';
import { PermissionGuard } from 'rbac/permission.guard';
import type { UserCreateInput, UserGetPayload } from './types/user.type';
import { UsersService } from './users.service';
import { CurrentUser } from "decorator/current-user.decorator";

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @RequirePermissions('user:create')
  @UseInterceptors(NoFilesInterceptor())
  create(@Body() createUserRequest: UserCreateInput, @CurrentUser() currentUser) {
    return this.usersService.create(createUserRequest, currentUser);
  }

  @Get('me')
  getMe(@CurrentUser() user: UserGetPayload) {
    return this.usersService.getMe(user.id)
  }

  @Get()
  @RequirePermissions('user:read')
  findAll(
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
    @Query('qs') qs: string,
  ) {
    return this.usersService.findAll(+current, +pageSize, qs);
  }

  @Get(':id')
  @RequirePermissions('user:read')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('user:update')
  update(@Param('id') id: string, @Body() data: any) {
    return this.usersService.update(id, data);
  }

  @Delete(':id')
  @RequirePermissions('user:delete')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
