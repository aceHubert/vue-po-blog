/**
 * 权限验证
 */
import { Reflector } from '@nestjs/core';
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { GqlExecutionContext, GqlContextType } from '@nestjs/graphql';
import { GraphQLResolveInfo, GraphQLOutputType, isObjectType, isInterfaceType, isWrappingType } from 'graphql';
import { FieldsByTypeName, parse } from 'graphql-parse-resolve-info';
import { I18nService } from 'nestjs-i18n';
import { getContextObject } from '../utils/get-context-object.util';
import { ROLES_KEY } from '../constants';

// Types
import { UserRole } from '@/users/enums';

@Injectable()
export class AuthorizedGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly i18nService: I18nService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = getContextObject(context);
    if (!ctx) {
      throw Error(`context type: ${context.getType()} not supported`);
    }

    const type = context.getType<GqlContextType>();
    const user: JwtPayload | null = ctx.user;
    const lang: string | undefined = ctx.i18nLang;

    // graphql 判断返回实体字段是否有权限
    if (type === 'graphql') {
      const info = GqlExecutionContext.create(context).getInfo<GraphQLResolveInfo>();

      /**
       * 这里未使用 FieldMiddleware 原因在于中间件对每个 field 是隔离的，当其中 field 验证失败时，ResoloveField 会继续执行
       * https://docs.nestjs.com/graphql/extensions
       */
      // @FieldAuthorized
      const fieldRoles = this.resolveGraphqlOutputFieldsRoles(info);
      if (Object.keys(fieldRoles).length && !user) {
        // 没有的提供 token, return 401
        throw new UnauthorizedException(await this.i18nService.t('error.unauthorized', { lang }));
      }
      for (const field in fieldRoles) {
        if (!this.hasPermission(user!, fieldRoles[field])) {
          // false return 403
          throw new ForbiddenException(
            await this.i18nService.t('error.forbidden_field', { lang, args: { field, userRole: user!.role } }),
          );
        }
      }
    }

    // method 覆写 class 权限
    const roles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [context.getHandler(), context.getClass()]);

    // no @Authorized
    if (!roles) {
      return true;
    }

    if (!user) {
      // 没有的提供 token, return 401
      throw new UnauthorizedException(await this.i18nService.t('error.unauthorized', { lang }));
    } else if (!this.hasPermission(user, roles)) {
      // false return 403
      throw new ForbiddenException(await this.i18nService.t('error.forbidden', { lang }));
    }
    return true;
  }

  /**
   * 判断用户角色是否在提供的角色内
   * @param user 用户
   * @param roles 角色，如果用户色值有值但提供的角色长度为0，会直接返回true
   */
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

  /**
   * 获取 Graphql Output fields 的角色权限
   * @param info GraphQLResolveInfo
   */
  private resolveGraphqlOutputFieldsRoles(info: GraphQLResolveInfo): { [field: string]: UserRole[] } {
    const parsedResolveInfoFragment = parse(info, { keepRoot: false, deep: true });

    if (!parsedResolveInfoFragment) {
      return {};
    }

    const rootFields = parsedResolveInfoFragment.fieldsByTypeName
      ? (parsedResolveInfoFragment.fieldsByTypeName as FieldsByTypeName)
      : (parsedResolveInfoFragment as FieldsByTypeName);

    return resolveFields(rootFields, info.returnType);

    function resolveFields(
      fieldsByTypeName: FieldsByTypeName,
      type: GraphQLOutputType,
      parentTypeName?: string,
      fieldRoles: { [field: string]: UserRole[] } = {},
    ) {
      const returnType = getUnWrappingType(type);

      // todo: isUnionType
      if (isObjectType(returnType) || isInterfaceType(returnType)) {
        for (const key in fieldsByTypeName[returnType.name]) {
          const fields = returnType.getFields();
          if (fields[key].extensions?.roles) {
            fieldRoles[`${parentTypeName ? parentTypeName + '.' : ''}${key}`] = fields[key].extensions?.roles;
          }
          Object.keys(fieldsByTypeName[returnType.name][key].fieldsByTypeName).length &&
            resolveFields(
              fieldsByTypeName[returnType.name][key].fieldsByTypeName,
              fields[key].type,
              fieldsByTypeName[returnType.name][key].name,
              fieldRoles,
            );
        }
      }
      return fieldRoles;
    }

    function getUnWrappingType(type: GraphQLOutputType): any {
      if (isWrappingType(type)) {
        return getUnWrappingType(type.ofType);
      }
      return type;
    }
  }
}
