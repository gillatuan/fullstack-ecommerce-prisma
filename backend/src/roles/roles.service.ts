import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { PrismaService } from '@/prisma/prisma.service';
import {
  Injectable,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import { Permission, Prisma } from 'generated/prisma/client';

@UseGuards(JwtAuthGuard)
@Injectable()
export class RolesService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createRoleDto: Prisma.RoleCreateInput) {
    try {
      return await this.prismaService.role.create({
        data: {
          ...createRoleDto,
          name: createRoleDto.name.toUpperCase(),
        },
        select: {
          name: true,
          permissions: true,
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
    return `This action returns all roles`;
  }

  findOne(id: number) {
    return `This action returns a #${id} role`;
  }

  update(id: number, updateRoleDto: Prisma.RoleUpdateInput) {
    return `This action updates a #${id} role`;
  }

  remove(id: number) {
    return `This action removes a #${id} role`;
  }
}
