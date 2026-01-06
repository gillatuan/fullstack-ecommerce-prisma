import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import * as bcryptjs from 'bcryptjs';
import { CreateUserRequest } from './dto/create-user.dto';
import { UserWhereUniqueInput } from "@/generated/prisma/models";
import { PrismaService } from "@/src/prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(data: CreateUserRequest) {
    try {
      return await this.prismaService.user.create({
        data: {
          ...data,
          password: await bcryptjs.hash(data.password, 10),
        },
        select: {
          email: true,
          id: true,
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
    return this.prismaService.user.findUniqueOrThrow({
      where: filter,
    });
  }
}
