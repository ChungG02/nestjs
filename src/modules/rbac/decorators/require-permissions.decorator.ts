import { SetMetadata } from '@nestjs/common';

import { PermissionCode } from '../constants/rbac.constants';

export const REQUIRED_PERMISSIONS_KEY = 'required_permissions';

export const RequirePermissions = (...permissions: PermissionCode[]) =>
  SetMetadata(REQUIRED_PERMISSIONS_KEY, permissions);
