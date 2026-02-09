import { AuthLoginResponse } from '@/auth/types/auth.type';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import aqp from 'api-query-params';
import * as argon2 from 'argon2';
import { ERRORS_DICTIONARY } from 'const/constraint/error-dictionary';
import { Prisma } from 'generated/prisma/client';
import { UserWhereUniqueInput } from 'generated/prisma/models';
import { PrismaService } from '../prisma/prisma.service';
import { UserCreateInput, userPermissionSelect } from './types/user.type';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: UserCreateInput, currentUser: AuthLoginResponse) {
    const { roles, password, ...rest } = data;
    let roleIdsToAssign: string[] = [];

    // 1. Kiểm tra quyền của người tạo
    const isSuperAdmin = currentUser?.roles?.includes('SUPER_ADMIN');

    if (isSuperAdmin && roles && roles.length > 0) {
      // Nếu là SUPER_ADMIN và có truyền roles -> Chấp nhận roles đó
      roleIdsToAssign = roles;
    } else {
      // Nếu KHÔNG phải SUPER_ADMIN -> Ép buộc gán Role MEMBER
      const memberRole = await this.prismaService.role.findUnique({
        where: { name: 'MEMBER' },
      });
      if (!memberRole) {
        throw new InternalServerErrorException({
          message: ERRORS_DICTIONARY.UNAUTHORIZED_EXCEPTION,
          details: 'Default Role not found.',
        });
      }

      roleIdsToAssign = [memberRole.id];
    }

    try {
      return await this.prismaService.user.create({
        data: {
          ...data,
          password: await argon2.hash(data.password),
          roles: {
            create: roleIdsToAssign.map((id) => ({
              role: { connect: { id } },
            })),
          },
        },
        select: userPermissionSelect,
      });
    } catch (err) {
      if (err.code === 'P2002') {
        throw new UnprocessableEntityException('Email already exists.');
      }
      throw err;
    }
  }

  async getMe(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      select: userPermissionSelect, // Sử dụng selection bạn đã định nghĩa để bảo mật password
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findAll(currentPage: number = 1, limit: number = 10, qs: string) {
    const { filter, sort, population, projection } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    const offset = (+currentPage - 1) * +limit || 0;
    const pageSize = +limit || 10;

    const where: Prisma.UserWhereInput = filter;
    const orderBy: Prisma.UserOrderByWithRelationInput | undefined = sort;

    const totalItems = await this.prismaService.user.count({ where });
    const totalPages = Math.ceil(totalItems / pageSize);
    const result = await this.prismaService.user.findMany({
      skip: offset,
      take: pageSize,
      where,
      orderBy,
      select: userPermissionSelect,
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
      return await this.prismaService.user.findUniqueOrThrow({
        where: { id },
        select: userPermissionSelect,
      });
    } catch (error) {
      throw new BadRequestException({
        message: ERRORS_DICTIONARY.ROLE_NOT_FOUND,
        details: 'User not found.',
      });
    }
  }

  async update(id: string, data: Partial<UserCreateInput>) {
    const { roles, password, ...rest } = data;
    const updateData: Prisma.UserUpdateInput = { ...rest };

    if (password) {
      updateData.password = await argon2.hash(password);
    }

    if (roles) {
      // Sync quan hệ nhiều-nhiều bằng cách xóa cũ tạo mới trong bảng trung gian
      await this.prismaService.userRole.deleteMany({ where: { userId: id } });
      updateData.roles = {
        create: roles.map((roleId) => ({
          role: { connect: { id: roleId } },
        })),
      };
    }

    return this.prismaService.user.update({
      where: { id },
      data: updateData,
      select: userPermissionSelect,
    });
  }

  async remove(id: string) {
    const user = await this.findOne(id);

    // Không cho xóa role hệ thống
    if (['SUPER_ADMIN'].includes(user.roles[0].role.name)) {
      throw new NotFoundException({
        message: ERRORS_DICTIONARY.UNAUTHORIZED_EXCEPTION,
        details: 'Cannot delete system role.',
      });
    }

    return this.prismaService.$transaction(async (tx) => {
      // 1. Xóa user-role mapping của user
      await tx.userRole.deleteMany({
        where: { userId: id },
      });

      // 2. Xóa user
      return tx.user.delete({
        where: { id },
      });
    });
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
