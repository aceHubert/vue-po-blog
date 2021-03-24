import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../helpers/enums';
import { ROLES_KEY } from '../constants';

/**
 * 角色权限 @Authorized([roles])
 * @param roles Roles
 */
export const Authorized = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
