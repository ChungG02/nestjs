import dataSource from '../data-source';

import {
  PERMISSION_CODES,
  PermissionCode,
  ROLE_CODES,
  RoleCode,
} from '../../src/modules/rbac/constants/rbac.constants';
import { PermissionEntity } from '../../src/modules/rbac/entities/permission.entity';
import { RolePermissionEntity } from '../../src/modules/rbac/entities/role-permission.entity';
import { RoleEntity } from '../../src/modules/rbac/entities/role.entity';

interface PermissionSeed {
  code: PermissionCode;
  name: string;
  description: string;
}

interface RoleSeed {
  code: RoleCode;
  name: string;
  description: string;
  permissions: readonly PermissionCode[];
}

const permissionSeeds: readonly PermissionSeed[] = [
  {
    code: PERMISSION_CODES.TASK_CREATE,
    name: 'Tạo công việc',
    description: 'Cho phép tạo công việc mới',
  },
  {
    code: PERMISSION_CODES.TASK_READ,
    name: 'Xem công việc',
    description: 'Cho phép xem thông tin công việc',
  },
  {
    code: PERMISSION_CODES.TASK_UPDATE,
    name: 'Cập nhật công việc',
    description: 'Cho phép cập nhật thông tin công việc',
  },
  {
    code: PERMISSION_CODES.TASK_DELETE,
    name: 'Xóa công việc',
    description: 'Cho phép xóa công việc',
  },
  {
    code: PERMISSION_CODES.TASK_ASSIGN,
    name: 'Giao công việc',
    description: 'Cho phép giao công việc cho thành viên',
  },
  {
    code: PERMISSION_CODES.USER_READ,
    name: 'Xem người dùng',
    description: 'Cho phép xem danh sách và thông tin người dùng',
  },
  {
    code: PERMISSION_CODES.USER_MANAGE,
    name: 'Quản lý người dùng',
    description: 'Cho phép cập nhật và quản lý tài khoản người dùng',
  },
  {
    code: PERMISSION_CODES.ROLE_MANAGE,
    name: 'Quản lý phân quyền',
    description: 'Cho phép quản lý role và permission',
  },
];

const allPermissionCodes = permissionSeeds.map((permission) => permission.code);

const roleSeeds: readonly RoleSeed[] = [
  {
    code: ROLE_CODES.ADMIN,
    name: 'Quản trị viên',
    description: 'Có toàn bộ quyền quản trị hệ thống',
    permissions: allPermissionCodes,
  },
  {
    code: ROLE_CODES.PROJECT_MANAGER,
    name: 'Quản lý dự án',
    description: 'Quản lý và phân công công việc trong dự án',
    permissions: [
      PERMISSION_CODES.TASK_CREATE,
      PERMISSION_CODES.TASK_READ,
      PERMISSION_CODES.TASK_UPDATE,
      PERMISSION_CODES.TASK_DELETE,
      PERMISSION_CODES.TASK_ASSIGN,
      PERMISSION_CODES.USER_READ,
    ],
  },
  {
    code: ROLE_CODES.MEMBER,
    name: 'Thành viên',
    description: 'Thực hiện và cập nhật những công việc được phép truy cập',
    permissions: [
      PERMISSION_CODES.TASK_CREATE,
      PERMISSION_CODES.TASK_READ,
      PERMISSION_CODES.TASK_UPDATE,
    ],
  },
];

async function seedRbac(): Promise<void> {
  await dataSource.initialize();
  try {
    await dataSource.transaction(async (entityManager) => {
      const permissionRepository =
        entityManager.getRepository(PermissionEntity);
      const roleRepository = entityManager.getRepository(RoleEntity);
      const rolePermissionRepository =
        entityManager.getRepository(RolePermissionEntity);

      const permissionsByCode = new Map<PermissionCode, PermissionEntity>();

      for (const permissionSeed of permissionSeeds) {
        let permission = await permissionRepository.findOneBy({
          code: permissionSeed.code,
        });

        if (permission) {
          permissionRepository.merge(permission, permissionSeed);
        } else {
          permission = permissionRepository.create(permissionSeed);
        }

        const savedPermission = await permissionRepository.save(permission);

        permissionsByCode.set(permissionSeed.code, savedPermission);
      }

      for (const roleSeed of roleSeeds) {
        let role = await roleRepository.findOneBy({
          code: roleSeed.code,
        });

        const roleData = {
          code: roleSeed.code,
          name: roleSeed.name,
          description: roleSeed.description,
          isSystem: true,
        };

        if (role) {
          roleRepository.merge(role, roleData);
        } else {
          role = roleRepository.create(roleData);
        }

        const savedRole = await roleRepository.save(role);

        await rolePermissionRepository.delete({
          roleId: savedRole.id,
        });

        for (const permissionCode of roleSeed.permissions) {
          const permission = permissionsByCode.get(permissionCode);

          if (!permission) {
            throw new Error(`Permission not found: ${permissionCode}`);
          }

          await rolePermissionRepository.save(
            rolePermissionRepository.create({
              roleId: savedRole.id,
              permissionId: permission.id,
            }),
          );
        }
      }
    });

    console.log('RBAC seed completed successfully');
  } finally {
    await dataSource.destroy();
  }
}

void seedRbac().catch((error: unknown) => {
  console.error('RBAC seed failed', error);
  process.exitCode = 1;
});
