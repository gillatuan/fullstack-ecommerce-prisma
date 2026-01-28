import { UserRole } from '@/auth/types/auth.type';
import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserWhereUniqueInput } from 'generated/prisma/models';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserRequest } from './dto/create-user.dto';
import { UserResponse } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(data: CreateUserRequest): Promise<UserResponse> {
    try {
      return await this.prismaService.user.create({
        data: {
          ...data,
          password: await bcrypt.hash(data.password, 10),
          roleId: data.roleId ?? UserRole.USER,
        },
        select: {
          email: true,
          name: true,
          roleId: true,
        },
      });
    } catch (err) {
      if (err.code === 'P2002') {
        throw new UnprocessableEntityException('Email already exists.');
      }
      throw err;
    }
  }

  async getUser(filter: UserWhereUniqueInput) {
    return await this.prismaService.user.findUnique({
      where: filter,
    });
  }
}
