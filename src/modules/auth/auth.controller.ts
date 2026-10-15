import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthenticatedUser } from './types/authenticated-user.interface';
import { LoginResponse } from './types/login-response.interface';
import { RegisterResponse } from './types/register-response.interface';
import { PERMISSION_CODES } from '../rbac/constants/rbac.constants';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() registerDto: RegisterDto): Promise<RegisterResponse> {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
    return this.authService.login(loginDto);
  }

  @Get('me')
  getMe(@CurrentUser() user: AuthenticatedUser): AuthenticatedUser {
    return user;
  }

  @Get('permission-check')
  @RequirePermissions(PERMISSION_CODES.ROLE_MANAGE)
  checkPermission(@CurrentUser() user: AuthenticatedUser) {
    return {
      message: 'Bạn có quyền truy cập',
      user,
    };
  }
}
