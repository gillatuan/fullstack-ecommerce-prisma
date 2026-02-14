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
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  // ✅ Allows unauthenticated signup (public endpoint)
  // JwtAuthGuard is skipped for signup; currentUser will be null for public users
  @UseInterceptors(NoFilesInterceptor())
  create(@Body() createUserRequest: UserCreateInput, @CurrentUser() currentUser) {
    return this.usersService.create(createUserRequest, currentUser);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  getMe(@CurrentUser() user: UserGetPayload) {
    return this.usersService.getMe(user.id)
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermissions('user:read')
  findAll(
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
    @Query('qs') qs: string,
  ) {
    return this.usersService.findAll(+current, +pageSize, qs);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermissions('user:read')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermissions('user:update')
  update(@Param('id') id: string, @Body() data: any) {
    return this.usersService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermissions('user:delete')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
