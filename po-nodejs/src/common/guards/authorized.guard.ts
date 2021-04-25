/**
 * 权限验证
 */
import { Reflector } from '@nestjs/core';
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { GqlExecutionContext, GqlContextType } from '@nestjs/graphql';
import { GraphQLResolveInfo, GraphQLNonNull, isObjectType, isInterfaceType } from 'graphql';
import { Request } from 'express';
import { UserRole } from '../helpers/enums';
import { ROLES_KEY } from '../constants';

@Injectable()
export class AuthorizedGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // method 覆写 class 权限
    const roles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [context.getHandler(), context.getClass()]);
    // no @Authorized
    if (!roles) {
      return true;
    }

    const type = context.getType<GqlContextType>();
    let user: JwtPayload | null = null;
    if (type === 'http') {
      const request = context.switchToHttp().getRequest<Request>();
      user = request.user as JwtPayload;
    } else if (type === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(context);
      user = gqlCtx.getContext<GqlContext>().user;

      /**
       * 这里未使用 FieldMiddleware 原因在于中间件对每个 field 是隔离的，当其中 field 验证失败时，ResoloveField 会继续执行
       * https://docs.nestjs.com/graphql/extensions
       */
      const info = gqlCtx.getInfo<GraphQLResolveInfo>();
      const returnType = info.returnType instanceof GraphQLNonNull ? info.returnType.ofType : info.returnType;
      if (isObjectType(returnType) || isInterfaceType(returnType)) {
        const fields = returnType.getFields();
        for (const key in fields) {
          const fieldRoles = fields[key].extensions?.roles;
          if (fieldRoles) {
            // @FieldAuthorized
            if (!user) {
              // 没有的提供 token, return 401
              throw new UnauthorizedException('Unauthorized');
            } else {
              return this.hasPermission(user, fieldRoles);
            }
          }
        }
      }
    } else {
      // todo: 其它类型
    }

    if (!user) {
      // 没有的提供 token, return 401
      throw new UnauthorizedException('Unauthorized');
    } else {
      return this.hasPermission(user, roles); // false return 403
    }
  }

  private hasPermission(user: JwtPayload, roles: UserRole[]): boolean {
    if (user.role && !roles.length) {
      // 有角色(有 none 情况)，但role没有限制时(@Authorized()/@FieldAuthorized())，可以访问
      return true;
    } else {
      // 没有角色，或角色不在roles内时(@Authorized([...roles]/@FieldAuthorized([...roles])))
      const hasRole = (role: UserRole) => roles.includes(role);
      return Boolean(user.role && hasRole(user.role));
    }
  }
}
