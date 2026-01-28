import { PrismaService } from '@/prisma/prisma.service';
import type { UserType } from '@/users/types/user.type';
import {
  BadRequestException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import aqp from 'api-query-params';
import { Prisma } from 'generated/prisma/client';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createPermissionDto: Prisma.PermissionCreateInput) {
    try {
      return await this.prismaService.permission.create({
        data: {
          ...createPermissionDto,
          name: createPermissionDto.name.toUpperCase(),
          module: createPermissionDto.module.toUpperCase(),
          method: createPermissionDto.method.toUpperCase(),
        },
        select: {
          name: true,
          module: true,
          apiPath: true,
          method: true,
        },
      });
    } catch (err) {
      if (err.code === 'P2002') {
        throw new UnprocessableEntityException('Name & Module already exists.');
      }
      throw err;
    }
  }

  async findAll(currentPage: number = 1, limit: number = 10, qs: string) {
    const { filter, sort, population, projection } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    const offset = (+currentPage - 1) * +limit || 0;
    const pageSize = +limit || 10;

    const where: Prisma.PermissionWhereInput = filter;
    const orderBy: Prisma.PermissionOrderByWithRelationInput | undefined = sort;
    const select: Prisma.PermissionSelect | undefined = projection;

    const totalItems = await this.prismaService.permission.count({ where });
    const totalPages = Math.ceil(totalItems / pageSize);
    const result = await this.prismaService.permission.findMany({
      skip: offset,
      take: pageSize,
      where,
      orderBy,
      select,
    });

    return {
      meta: {
        current: currentPage || 1, //trang hiện tại
        pageSize, //số lượng bản ghi đã lấy
        totalPages, //tổng số trang với điều kiện query
        totalItems, // tổng số phần tử (số bản ghi)
      },
      result, //kết quả query
    };
  }

  async findOne(id: number) {
    try {
      return await this.prismaService.permission.findUniqueOrThrow({
        where: { id },
      });
    } catch (error) {
      throw new BadRequestException('Permission not found');
    }
  }

  async update(
    id: number,
    updatePermissionDto: UpdatePermissionDto,
  ) {
    const result = await this.prismaService.permission.findUniqueOrThrow({
      where: { id },
    });

    if (!result) {
      throw new BadRequestException('Permission not found');
    }

    try {
      return await this.prismaService.permission.update({
        where: { id },
        data: {
          ...updatePermissionDto,
          name: updatePermissionDto.name?.toUpperCase(),
          module: updatePermissionDto.module?.toUpperCase(),
          method: updatePermissionDto.method?.toUpperCase(),
        },
        select: {
          name: true,
          module: true,
          apiPath: true,
          method: true,
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to update permission');
    }
  }

  async remove(id: number) {
    try {
      return await this.prismaService.permission.delete({
        where: { id },
      });
    } catch (error) {
      throw new BadRequestException('Permission not found');
    }
  }
}
