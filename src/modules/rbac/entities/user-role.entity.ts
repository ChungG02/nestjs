import {
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Relation,
} from 'typeorm';

import { UserEntity } from '../../users/entities/user.entity';
import { RoleEntity } from './role.entity';

@Entity({ name: 'user_roles' })
@Index('idx_user_roles_role_id', ['roleId'])
export class UserRoleEntity {
  @PrimaryColumn({
    name: 'user_id',
    type: 'varchar',
    length: 36,
  })
  userId!: string;

  @PrimaryColumn({
    name: 'role_id',
    type: 'varchar',
    length: 36,
  })
  roleId!: string;

  @ManyToOne(() => UserEntity, (user) => user.userRoles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'fk_user_roles_user',
  })
  user!: Relation<UserEntity>;

  @ManyToOne(() => RoleEntity, (role) => role.userRoles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'role_id',
    foreignKeyConstraintName: 'fk_user_roles_role',
  })
  role!: Relation<RoleEntity>;

  @CreateDateColumn({
    name: 'assigned_at',
    type: 'datetime',
    precision: 6,
  })
  assignedAt!: Date;
}
