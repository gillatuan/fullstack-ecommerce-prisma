import { PrismaService } from '@/prisma/prisma.service';
import {
  BadRequestException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import aqp from 'api-query-params';
import { Prisma } from 'generated/prisma/client';

@Injectable()
export class PermissionsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createPermissionDto: Prisma.PermissionCreateInput) {
    try {
      return await this.prismaService.permission.create({
        data: {
          ...createPermissionDto,
          action: createPermissionDto.action.toUpperCase(),
          resource: createPermissionDto.resource.toUpperCase(),
        },
        select: {
          action: true,
          resource: true,
          roles: true
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

  async findOne(id: string) {
    try {
      return await this.prismaService.permission.findUniqueOrThrow({
        where: { id },
      });
    } catch (error) {
      throw new BadRequestException('Permission not found');
    }
  }

  async update(id: string, updatePermissionDto: Prisma.PermissionUpdateInput) {
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
          action: updatePermissionDto.action?.toString().toUpperCase(),
          resource: updatePermissionDto.resource?.toString().toUpperCase(),
          roles: updatePermissionDto.roles
        },
        select: {
          action: true,
          resource: true,
          roles: true
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to update permission');
    }
  }

  async remove(id: string) {
    try {
      return await this.prismaService.permission.delete({
        where: { id },
      });
    } catch (error) {
      throw new BadRequestException('Permission not found');
    }
  }
}
