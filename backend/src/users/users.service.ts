import { Injectable } from '@nestjs/common';
import { ConfigService } from "@nestjs/config";
import { User } from "@/generated/prisma/client";
import { CreateUserRequest } from "./dto/create-user-request";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService
  ){}

  async createUser(data: CreateUserRequest): Promise<User> {
    return await this.prismaService.user.create({
      data,
    })
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: { email },
    });
  }
}
