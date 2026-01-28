import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from 'generated/prisma/client';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';

jest.mock('api-query-params', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('PermissionsController', () => {
  let controller: PermissionsController;
  let service: jest.Mocked<PermissionsService>;

  const mockPermissionService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  // ---------- ARRANGE ----------
  const dto: CreatePermissionDto = {
    name: 'CREATE_USER',
    apiPath: '/users',
    method: 'POST',
    module: 'PERMISSIONS',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissionsController],
      providers: [
        {
          provide: PermissionsService,
          useValue: mockPermissionService,
        },
      ],
    }).compile();

    controller = module.get<PermissionsController>(PermissionsController);
    service = module.get(PermissionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return a list of permissions', async () => {
      // ---------- ARRANGE ----------
      const mockResult = {
        meta: {
          current: 1,
          pageSize: 10,
          totalItems: 1,
          totalPages: 1,
        },
        data: [{ id: '1', name: 'CREATE_POST' }],
      };

      mockPermissionService.findAll.mockResolvedValue(mockResult);

      // ---------- ACT ----------
      const result = await controller.findAll(
        '1',
        '10',
        '?filter[name]=CREATE_POST&sort=-createdAt',
      );

      // ---------- ASSERT ----------
      expect(service.findAll).toHaveBeenCalledWith(
        1,
        10,
        '?filter[name]=CREATE_POST&sort=-createdAt',
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('create', () => {
    it('should create a permission', async () => {
      const created = { id: 1, ...dto };
      const mockResult: Prisma.PermissionCreateInput = created;

      service.create.mockResolvedValue(mockResult);

      // ---------- ACT ----------
      const result = await controller.create(dto);
      // ---------- ASSERT ----------
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockResult);
    });
  });

  // =========================
  // FIND ONE
  // =========================
  describe('findOne', () => {
    it('should return a permission by id', async () => {
      const permission = {id: 1, ...dto}

      mockPermissionService.findOne.mockResolvedValue(permission);

      const result = await controller.findOne('1');

      expect(service.findOne).toHaveBeenCalledWith(result.id);
      expect(result).toEqual(permission);
    });
  });

  // =========================
  // UPDATE
  // =========================
  describe('update', () => {
    it('should update a permission', async () => {
      const permission = { id: '1', ...dto };
      const updated = { ...permission, name: 'UPDATED_NAME' };

      mockPermissionService.update.mockResolvedValue(updated);

      const result = await controller.update('1', dto );

      expect(service.update).toHaveBeenCalledWith(+permission.id, dto);
      expect(result).toEqual(updated);
    });
  });

  // =========================
  // REMOVE
  // =========================
  describe('remove', () => {
    it('should delete a permission', async () => {
      const permission = { id: '1', ...dto };

      mockPermissionService.remove.mockResolvedValue(permission);

      const result = await controller.remove(permission.id);

      expect(service.remove).toHaveBeenCalledWith(+permission.id);
      expect(result).toEqual(permission);
    });
  });
});
