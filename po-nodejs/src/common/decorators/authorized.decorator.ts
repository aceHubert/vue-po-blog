import { SetMetadata, CustomDecorator } from '@nestjs/common';
import { getArrayFromOverloadedRest } from '../helpers/decorators';
import { UserRole } from '../helpers/enums';
import { ROLES_KEY } from '../constants';

/**
 * 角色权限验证
 * 当角色为空时，验证是否登录，否则返回 401
 * 当定义角色时，验证登录并验证角色，否则返回 403
 * @param roles UserRoles
 */
export function Authorized(roles: UserRole[]): CustomDecorator;
export function Authorized(...roles: UserRole[]): CustomDecorator;
export function Authorized(...rolesOrRolesArray: Array<UserRole | UserRole[]>): CustomDecorator {
  const roles = getArrayFromOverloadedRest(rolesOrRolesArray);
  return SetMetadata(ROLES_KEY, roles);
}

/**
 * Method 匿名访问
 * 通过 reflector.getAllAndOverride() 将 Class 上添加的 @Authorized 进行覆写，使 Method 匿名访问
 */
export function Anonymous() {
  return SetMetadata(ROLES_KEY, null);
}

/**
 * graphql Field 角色权限验证
 * @param roles UserRoles
 */
export function FieldAuthorized(roles: UserRole[]): PropertyDecorator;
export function FieldAuthorized(...roles: UserRole[]): PropertyDecorator;
export function FieldAuthorized(...rolesOrRolesArray: Array<UserRole | UserRole[]>): PropertyDecorator {
  const roles = getArrayFromOverloadedRest(rolesOrRolesArray);
  return (target, key) => {
    Reflect.defineMetadata(ROLES_KEY, roles, target, key);
    return target;
  };
}
