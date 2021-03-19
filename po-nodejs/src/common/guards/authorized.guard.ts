/**
 * 权限验证
 */
import { Reflector } from '@nestjs/core';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthService } from '@/auth/auth.service';
import { UserRole } from '../helpers/enums';
import { getToken } from '../utils/get-token.utils';
import { ROLES_KEY } from '../constants';

@Injectable()
export class AuthorizedGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [context.getHandler(), context.getClass()]);
    // no @Authorized
    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = getToken(request);

    if (token) {
      const { role } = await this.authService.verifyToken(token);

      const hasRole = (role: UserRole) => roles.includes(role);

      return Boolean(role && hasRole(role));
    }

    // todo 其它类型时
    return true;
  }
}
