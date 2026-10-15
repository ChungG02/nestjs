export const ROLE_CODES = {
    ADMIN: 'admin',
    PROJECT_MANAGER: 'project_manager',
    MEMBER: 'member',
} as const;

export type RoleCode = (typeof ROLE_CODES)[keyof typeof ROLE_CODES];

export const PERMISSION_CODES = {
    TASK_CREATE: 'task.create',
    TASK_READ: 'task.read',
    TASK_UPDATE: 'task.update',
    TASK_DELETE: 'task.delete',
    TASK_ASSIGN: 'task.assign',
    USER_READ: 'user.read',
    USER_MANAGE: 'user.manage',
    ROLE_MANAGE: 'role.manage',
} as const;

export type PermissionCode = (typeof PERMISSION_CODES)[keyof typeof PERMISSION_CODES];