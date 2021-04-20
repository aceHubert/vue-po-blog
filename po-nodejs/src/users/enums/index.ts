import { registerEnumType } from '@nestjs/graphql';
import { UserRole } from './user-role.enum';
import { UserRoleWithNone } from './user-role-with-none.enum';
import { UserStatus } from './user-status.enum';

registerEnumType(UserRole, {
  name: 'USER_ROLE',
  description: 'user role',
});

registerEnumType(UserRoleWithNone, {
  name: 'USER_ROLE_WITH_NONE',
  description: 'user role (includes "none")',
});

registerEnumType(UserStatus, {
  name: 'USER_STATUS',
  description: 'user status',
});

export { UserRole, UserRoleWithNone, UserStatus };
