import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { PrismaService } from '@/prisma/prisma.service';
import { RoleDto } from '@/roles/dto/role.dto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import aqp from 'api-query-params';
import { ERRORS_DICTIONARY } from 'const/constraint/error-dictionary';
import { Permission, Prisma } from 'generated/prisma/client';

@UseGuards(JwtAuthGuard)
@Injectable()
export class RolesService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(dto: RoleDto) {
    try {
      return this.prismaService.role.create({
        data: {
          name: dto.name,
          description: dto.description,

          permissions: dto.permissions
            ? {
                create: dto.permissions.map((permissionId) => ({
                  permission: {
                    connect: { id: permissionId },
                  },
                })),
              }
            : undefined,
        },

        include: {
          permissions: true,
        },
      });
    } catch (err) {
      if (err.code === 'P2002') {
        throw new UnprocessableEntityException({
          message: ERRORS_DICTIONARY.ITEM_DUPLICATED,
          details: 'Email already exists.',
        });
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

    const where: Prisma.RoleWhereInput = filter;
    const orderBy: Prisma.RoleOrderByWithRelationInput | undefined = sort;

    const totalItems = await this.prismaService.role.count({ where });
    const totalPages = Math.ceil(totalItems / pageSize);
    const result = await this.prismaService.role.findMany({
      skip: offset,
      take: pageSize,
      where,
      orderBy,
      include: {
        permissions: {
          include: { permission: true },
        },
        users: true
      },
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
      return await this.prismaService.role.findUniqueOrThrow({
        where: { id },
        include: {
          permissions: {
            include: { permission: true },
          },
          users: true
        },
      });
    } catch (error) {
      throw new BadRequestException({
        message: ERRORS_DICTIONARY.ROLE_NOT_FOUND,
        details: 'Role not found.',
      });
    }
  }

  async findByName(name: string) {
    try {
      return await this.prismaService.role.findUniqueOrThrow({
        where: { name },
        include: {
          permissions: {
            include: { permission: true },
          },
          users: true,
        },
      });
    } catch (error) {
      throw new BadRequestException({
        message: ERRORS_DICTIONARY.ROLE_NOT_FOUND,
        details: 'Role not found.',
      });
    }
  }

  async update(id: string, updateRoleDto: RoleDto) {
    await this.findOne(id);

    // sync N-N
    await this.prismaService.rolePermission.deleteMany({
      where: { roleId: id },
    });

    try {
      return await this.prismaService.role.update({
        where: { id },
        data: {
          ...updateRoleDto,
          permissions: updateRoleDto.permissions
            ? {
                create: (updateRoleDto.permissions).map(
                  (permissionId) => ({
                    permission: {
                      connect: { id: permissionId },
                    },
                  }),
                ),
              }
            : undefined,
        },
        include: {
          permissions: true,
          users: true,
        },
      });
    } catch (error) {
      throw new BadRequestException({
        message: ERRORS_DICTIONARY.FAILED_TO_UPDATE,
        details: 'Failed to update Role.',
      });
    }
  }

  async remove(id: string) {
    const role = await this.findOne(id)

    // Không cho xóa role hệ thống
    if (['SUPER_ADMIN', 'ADMIN', 'MEMBER'].includes(role.name)) {
      throw new NotFoundException({
        message: ERRORS_DICTIONARY.UNAUTHORIZED_EXCEPTION,
        details: 'Cannot delete system role.',
      });
    }

    return this.prismaService.$transaction(async (tx) => {
      // 1. Xóa user-role mapping
      await tx.userRole.deleteMany({
        where: { roleId: id },
      });

      // 2. Xóa role-permission mapping
      await tx.rolePermission.deleteMany({
        where: { roleId: id },
      });

      // 3. Xóa role
      return tx.role.delete({
        where: { id },
      });
    });
  }
}
