import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { RoleCode } from './constants/rbac.constants';
import { RoleEntity } from './entities/role.entity';
import { UserRoleEntity } from './entities/user-role.entity';
import { UserAuthorization } from './types/user-authorization.interface';

interface AuthorizationRow {
  roleCode: string;
  permissionCode: string | null;
}

@Injectable()
export class RbacService {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly rolesRepository: Repository<RoleEntity>,
    @InjectRepository(UserRoleEntity)
    private readonly userRolesRepository: Repository<UserRoleEntity>,
  ) {}

  async assignRoleToUser(
    userId: string,
    roleCode: RoleCode,
    entityManager?: EntityManager,
  ): Promise<void> {
    const rolesRepository = entityManager
      ? entityManager.getRepository(RoleEntity)
      : this.rolesRepository;
    const userRolesRepository = entityManager
      ? entityManager.getRepository(UserRoleEntity)
      : this.userRolesRepository;
    const role = await rolesRepository.findOneBy({
      code: roleCode,
    });
    if (!role) {
      throw new InternalServerErrorException(
        `Role hệ thống chưa được cấu hình: ${roleCode}`,
      );
    }
    const existingUserRole = await userRolesRepository.findOneBy({
      userId,
      roleId: role.id,
    });
    if (existingUserRole) {
      return;
    }
    await userRolesRepository.save(
      userRolesRepository.create({
        userId,
        roleId: role.id,
      }),
    );
  }
  async getUserAuthorization(userId: string): Promise<UserAuthorization> {
    const rows = await this.userRolesRepository
      .createQueryBuilder('userRole')
      .innerJoin('userRole.role', 'role')
      .leftJoin('role.rolePermissions', 'rolePermission')
      .leftJoin('rolePermission.permission', 'permission')
      .select('role.code', 'roleCode')
      .addSelect('permission.code', 'permissionCode')
      .where('userRole.userId = :userId', { userId })
      .getRawMany<AuthorizationRow>();

    const roles = new Set<string>();
    const permissions = new Set<string>();

    for (const row of rows) {
      roles.add(row.roleCode);
      if (row.permissionCode) {
        permissions.add(row.permissionCode);
      }
    }
    return {
      roles: [...roles].sort(),
      permissions: [...permissions].sort(),
    };
  }
}
