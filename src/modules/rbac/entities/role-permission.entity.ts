import {
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Relation,
} from 'typeorm';

import { PermissionEntity } from './permission.entity';
import { RoleEntity } from './role.entity';

@Entity({ name: 'role_permissions' })
@Index('idx_role_permissions_permission_id', ['permissionId'])
export class RolePermissionEntity {
  @PrimaryColumn({
    name: 'role_id',
    type: 'varchar',
    length: 36,
  })
  roleId!: string;

  @PrimaryColumn({
    name: 'permission_id',
    type: 'varchar',
    length: 36,
  })
  permissionId!: string;

  @ManyToOne(() => RoleEntity, (role) => role.rolePermissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'role_id',
    foreignKeyConstraintName: 'fk_role_permissions_role',
  })
  role!: Relation<RoleEntity>;

  @ManyToOne(
    () => PermissionEntity,
    (permission) => permission.rolePermissions,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'permission_id',
    foreignKeyConstraintName: 'fk_role_permissions_permission',
  })
  permission!: Relation<PermissionEntity>;

  @CreateDateColumn({
    name: 'granted_at',
    type: 'datetime',
    precision: 6,
  })
  grantedAt!: Date;
}
