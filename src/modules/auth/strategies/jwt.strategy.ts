import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { RbacService } from '../../rbac/rbac.service';
import { UsersService } from '../../users/users.service';
import { AuthenticatedUser } from '../types/authenticated-user.interface';
import { JwtPayload } from '../types/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly rbacService: RbacService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),

      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    if (!payload.sub) {
      throw new UnauthorizedException('Token không hợp lệ');
    }
    const user = await this.usersService.findActiveById(payload.sub);
    if (!user) {
      throw new UnauthorizedException(
        'Người dùng không tồn tại hoặc đã bị khóa',
      );
    }
    const authorization = await this.rbacService.getUserAuthorization(user.id);
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      roles: authorization.roles,
      permissions: authorization.permissions,
    };
  }
}
