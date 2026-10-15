import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AuthenticatedUser } from '../../auth/types/authenticated-user.interface';
import { PermissionCode } from '../constants/rbac.constants';
import { REQUIRED_PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';

interface RequestWithAuthenticatedUser {
  user?: AuthenticatedUser;
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndMerge<PermissionCode[]>(
      REQUIRED_PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredPermissions?.length) {
      return true;
    }
    const request = context
      .switchToHttp()
      .getRequest<RequestWithAuthenticatedUser>();
    const user = request.user;
    if (!user) {
      throw new UnauthorizedException('Bạn chưa đăng nhập');
    }
    const hasAllRequiredPermissions = requiredPermissions.every((permission) =>
      user.permissions.includes(permission),
    );

    if (!hasAllRequiredPermissions) {
      throw new ForbiddenException('Bạn không có quyền thực hiện thao tác này');
    }
    return true;
  }
}
