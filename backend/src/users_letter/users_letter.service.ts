import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsersLetterDto } from './dto/create-users_letter.dto';
import { UpdateUsersLetterDto } from './dto/update-users_letter.dto';

@Injectable()
export class UsersLetterService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: CreateUsersLetterDto) {
    try {
      return await this.prismaService.usersLetter.create({
        data: {
          ...data,
        },
        select: {
          email: true,
          fullName: true,
        },
      });
    } catch (err) {
      if (err.code === 'P2002') {
        throw new UnprocessableEntityException('Email already exists.');
      }
      throw err;
    }
  }

  findAll() {
    return `This action returns all usersLetter`;
  }

  findOne(id: number) {
    return `This action returns a #${id} usersLetter`;
  }

  update(id: number, updateUsersLetterDto: UpdateUsersLetterDto) {
    return `This action updates a #${id} usersLetter`;
  }

  remove(id: number) {
    return `This action removes a #${id} usersLetter`;
  }
}
