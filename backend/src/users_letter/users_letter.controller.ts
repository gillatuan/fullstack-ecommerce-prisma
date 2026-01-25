import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsersLetterService } from './users_letter.service';
import { CreateUsersLetterDto } from './dto/create-users_letter.dto';
import { UpdateUsersLetterDto } from './dto/update-users_letter.dto';

@Controller('users-letter')
export class UsersLetterController {
  constructor(private readonly usersLetterService: UsersLetterService) {}

  @Post()
  create(@Body() createUsersLetterDto: CreateUsersLetterDto) {
    return this.usersLetterService.create(createUsersLetterDto);
  }

  @Get()
  findAll() {
    return this.usersLetterService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersLetterService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUsersLetterDto: UpdateUsersLetterDto) {
    return this.usersLetterService.update(+id, updateUsersLetterDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersLetterService.remove(+id);
  }
}
