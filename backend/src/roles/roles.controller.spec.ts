import { Test, TestingModule } from '@nestjs/testing';
import { RoleDto, RoleWithRelations } from './dto/role.dto';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

describe('RolesController', () => {
  let controller: RolesController;
  let service: jest.Mocked<RolesService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [RolesService],
    }).compile();

    controller = module.get<RolesController>(RolesController);
    service = module.get(RolesService);
  });

  it('should create role with permissions', async () => {
    const dto: RoleDto = {
      name: 'ADMIN',
      permissions: ['perm-1', 'perm-2'],
    };

    const mockResult = {
      id: 'role-1',
      name: 'ADMIN',
      description: '',
      permissions: [
        { roleId: 'role-1', permissionId: 'perm-1' },
        { roleId: 'role-1', permissionId: 'perm-2' },
      ],
    };

    jest.spyOn(service, 'create').mockResolvedValue(mockResult);

    const result = await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(mockResult);
  });

  it('should update role & sync permissions', async () => {
    const dto: RoleDto = {
      name: 'EDITOR',
      permissions: ['perm-3'],
    };

    const mockResult: RoleWithRelations = {
      id: 'role-1',
      name: 'EDITOR',
      description: '',
      permissions: [{ roleId: 'role-1', permissionId: 'perm-3' }],
      users: []
    };

    jest.spyOn(service, 'update').mockResolvedValue(mockResult);

    const result = await controller.update('role-1', dto);

    expect(service.update).toHaveBeenCalledWith('role-1', dto);
    expect(result).toEqual(mockResult);
  });
});
