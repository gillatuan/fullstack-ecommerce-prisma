import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { UserWhereUniqueInput } from 'generated/prisma/models';
import { PrismaService } from '../prisma/prisma.service';
import { UserCreateInput } from './types/user.type';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(data: UserCreateInput) {
    try {
      return await this.prismaService.user.create({
        data: {
          ...data,
          password: await argon2.hash(data.password),
        },
        select: {
          email: true,
          roles: {
            select: {
              roleId: true,
            },
          },
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
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }
}
