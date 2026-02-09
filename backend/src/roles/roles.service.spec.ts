import { PrismaService } from '@/prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from './roles.service';

jest.mock('api-query-params', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    filter: {},
    sort: {},
    population: {},
    projection: {},
  })),
}));

describe('RolesService', () => {
  let service: RolesService;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const prismaMock = {
      role: {
        count: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      // Nếu có dùng transaction hoặc các bảng khác thì khai báo thêm ở đây
      rolePermission: {
        deleteMany: jest.fn(),
      },
      userRole: {
        deleteMany: jest.fn(),
      },
      $transaction: jest.fn((cb) => cb(prismaMock)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
    prismaService = module.get(PrismaService);
  });

  it('should return all roles (findAll)', async () => {
    const mockRoles = [{ id: '1', name: 'ADMIN' }];
    const totalItems = 1;

    // Mock count và findMany
    (prismaService.role.count as jest.Mock).mockResolvedValue(totalItems);
    (prismaService.role.findMany as jest.Mock).mockResolvedValue(mockRoles);

    const result = await service.findAll(1, 10, '');

    // Kiểm tra cấu trúc trả về { meta, result }
    expect(result.meta.totalItems).toBe(totalItems);
    expect(result.result).toEqual(mockRoles);
    expect(prismaService.role.findMany).toHaveBeenCalled();
  });

  it('should return role by id (findOne)', async () => {
    const mockRole = {
      id: '1',
      name: 'ADMIN',
      permissions: [],
      users: [],
    };

    // Ép kiểu (jest.Mock) để sửa lỗi Property 'mockResolvedValue' does not exist
    (prismaService.role.findUniqueOrThrow as jest.Mock).mockResolvedValue(
      mockRole,
    );

    const result = await service.findOne('1');

    expect(prismaService.role.findUniqueOrThrow).toHaveBeenCalledWith({
      where: { id: '1' },
      include: expect.any(Object),
    });
    expect(result).toEqual(mockRole);
  });

  it('should throw BadRequestException if role not found', async () => {
    // findUniqueOrThrow sẽ throw lỗi nếu không tìm thấy record
    (prismaService.role.findUniqueOrThrow as jest.Mock).mockRejectedValue(
      new Error('P2025'),
    );

    await expect(service.findOne('999')).rejects.toThrow(BadRequestException);
  });
});
