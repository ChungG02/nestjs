import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { DataSource, QueryFailedError } from 'typeorm';

import { ROLE_CODES } from '../rbac/constants/rbac.constants';
import { RbacService } from '../rbac/rbac.service';
import { UserEntity } from '../users/entities/user.entity';
import { PublicUser } from '../users/types/public-user.interface';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './types/jwt-payload.interface';
import { LoginResponse } from './types/login-response.interface';
import { RegisterResponse } from './types/register-response.interface';

interface MySqlDriverError {
  code?: string;
}

@Injectable()
export class AuthService {
  private readonly passwordSaltRounds = 12;
  private readonly accessTokenTtlSeconds: number;

  constructor(
    private readonly usersService: UsersService,
    private readonly rbacService: RbacService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {
    this.accessTokenTtlSeconds = this.configService.getOrThrow<number>(
      'JWT_ACCESS_TTL_SECONDS',
    );
  }

  async register(registerDto: RegisterDto): Promise<RegisterResponse> {
    const existingUser = await this.usersService.findByEmail(registerDto.email);

    if (existingUser) {
      throw new ConflictException('Email đã được sử dụng');
    }

    const passwordHash = await bcrypt.hash(
      registerDto.password,
      this.passwordSaltRounds,
    );

    try {
      const user = await this.dataSource.transaction(async (entityManager) => {
        const createdUser = await this.usersService.create(
          {
            email: registerDto.email,
            displayName: registerDto.displayName,
            passwordHash,
          },
          entityManager,
        );

        await this.rbacService.assignRoleToUser(
          createdUser.id,
          ROLE_CODES.MEMBER,
          entityManager,
        );

        return createdUser;
      });

      return {
        user: this.toPublicUser(user),
      };
    } catch (error: unknown) {
      if (this.isDuplicateEntryError(error)) {
        throw new ConflictException('Email đã được sử dụng');
      }

      throw error;
    }
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const user = await this.usersService.findByEmailWithPassword(
      loginDto.email,
    );

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Tài khoản đã bị khóa');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: this.accessTokenTtlSeconds,
      user: this.toPublicUser(user),
    };
  }

  private toPublicUser(user: UserEntity): PublicUser {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }

  private isDuplicateEntryError(error: unknown): boolean {
    if (!(error instanceof QueryFailedError)) {
      return false;
    }

    const driverError = error.driverError as MySqlDriverError;

    return driverError.code === 'ER_DUP_ENTRY';
  }
}