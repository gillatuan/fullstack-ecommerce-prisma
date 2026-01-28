import type { UserType } from '@/users/types/user.type';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Version,
} from '@nestjs/common';
import { UserDecorator } from 'decorator/current-user.decorator';
import { Prisma } from 'generated/prisma/client';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionsService } from './permissions.service';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Version('1')
  @Post()
  create(@Body() createPermissionDto: Prisma.PermissionCreateInput) {
    return this.permissionsService.create(createPermissionDto);
  }

  @Version('1')
  @Get()
  findAll(
    @Query("current") currentPage: string,
    @Query("pageSize") pageSize: string,
    @Query() qs: string
  ) {
    return this.permissionsService.findAll(+currentPage, +pageSize, qs);
  }

  @Version('1')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.permissionsService.findOne(+id);
  }

  @Version('1')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
    @UserDecorator() user: UserType,
  ) {
    return this.permissionsService.update(+id, updatePermissionDto, user);
  }

  @Version('1')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.permissionsService.remove(+id);
  }
}
