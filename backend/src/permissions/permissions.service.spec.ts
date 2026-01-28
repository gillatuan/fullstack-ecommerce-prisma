import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { PermissionsService } from './permissions.service';
import aqp from "api-query-params";

jest.mock('api-query-params', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const prismaMock = {
  permission: {
    count: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};
describe('PermissionsService', () => {
  let service: PermissionsService;
  let prismaService: jest.Mocked<PrismaService>;

  // Arrange
  const currentPage = 1;
  const limit = 10;
  const qs = '?filter[name]=CREATE_POST&sort=-createdAt';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get(PermissionsService);
    prismaService = module.get(PrismaService) as jest.Mocked<PrismaService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return paginated permissions list', async () => {
    (aqp as jest.Mock).mockReturnValue({
      filter: { name: 'CREATE_POST' },
      sort: { createdAt: 'desc' },
      population: undefined,
      projection: undefined,
    });
    
    const mockPermissions = [
      {
        id: 1,
        name: 'CREATE_POST',
        createdAt: new Date(),
      },
      {
        id: 2,
        name: 'CREATE_COMMENT',
        createdAt: new Date(),
      },
    ];

    (prismaService.permission.count as jest.Mock).mockResolvedValue(2);
    (prismaService.permission.findMany as jest.Mock).mockResolvedValue(
      mockPermissions,
    );

    // Act
    const result = await service.findAll(currentPage, limit, qs);

    // Assert
    expect(prismaService.permission.count).toHaveBeenCalledWith({
      where: { name: 'CREATE_POST' },
    });

    expect(prismaService.permission.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      where: { name: 'CREATE_POST' },
      orderBy: { createdAt: 'desc' },
      select: undefined,
    });

    expect(result).toEqual({
      meta: {
        current: 1,
        pageSize: 10,
        totalItems: 2,
        totalPages: 1,
      },
      result: mockPermissions,
    });
  });

  it('should return empty result when no permissions found', async () => {
    (prismaService.permission.count as jest.Mock).mockResolvedValue(0);
    (prismaService.permission.findMany as jest.Mock).mockResolvedValue([]);

    const result = await service.findAll(1, 10, '');

    expect(result).toEqual({
      meta: {
        current: 1,
        pageSize: 10,
        totalItems: 0,
        totalPages: 0,
      },
      result: [],
    });
  });

  it('should calculate offset correctly', async () => {
    (prismaService.permission.count as jest.Mock).mockResolvedValue(25);
    (prismaService.permission.findMany as jest.Mock).mockResolvedValue([]);

    await service.findAll(3, 5, '');

    expect(prismaService.permission.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10, // (3 - 1) * 5
        take: 5,
      }),
    );
  });
});
