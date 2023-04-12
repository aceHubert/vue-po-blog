import { Field, ObjectType, InterfaceType, ID } from '@nestjs/graphql';
import { FieldAuthorized } from '@/common/decorators/authorized.decorator';
import { PagedResponse, Count } from '@/common/resolvers/models/paged.model';
import { Meta } from '@/common/resolvers/models/meta.model';
import { UserRole, UserRoleWithNone, UserStatus } from '../enums';

@InterfaceType()
export abstract class BaseUser {
  @Field((type) => ID, { description: 'User id' })
  id!: number;

  @FieldAuthorized(UserRole.Administrator)
  @Field({ description: 'Login name' })
  loginName!: string;

  @Field({ description: 'Display name' })
  displayName!: string;

  @Field((type) => String, { nullable: true, description: 'Mobile number' })
  mobile!: string | null;

  @Field({ description: 'Email address' })
  email!: string;

  @Field((type) => String, { nullable: true, description: 'Home URL address' })
  url!: string | null;

  @Field((type) => UserStatus, { description: 'User status' })
  status!: UserStatus;

  @Field({ description: 'Update time' })
  updatedAt!: Date;

  @Field({ description: 'Creation time' })
  createdAt!: Date;
}

@ObjectType({ implements: BaseUser, description: 'User model' })
export class User implements BaseUser {
  id!: number;
  loginName!: string;
  displayName!: string;
  mobile!: string | null;
  email!: string;
  url!: string | null;
  status!: UserStatus;
  updatedAt!: Date;
  createdAt!: Date;
}

@ObjectType({ implements: BaseUser, description: 'User model with role' })
export class UserWithRole implements BaseUser {
  id!: number;
  loginName!: string;
  displayName!: string;
  mobile!: string | null;
  email!: string;
  url!: string | null;
  status!: UserStatus;
  updatedAt!: Date;
  createdAt!: Date;

  @Field((type) => UserRole, { nullable: true, description: 'User role' })
  userRole?: UserRole;
}

@ObjectType({ description: 'Basic user info' })
export class SimpleUser {
  @Field((type) => ID, { description: 'User id' })
  id!: number;

  @Field({ description: 'Display name' })
  displayName!: string;

  @Field({ description: 'Email address' })
  email!: string;
}

@ObjectType({ description: 'User paged model' })
export class PagedUser extends PagedResponse(UserWithRole) {
  // other fields
}

@ObjectType({ description: `User count by status` })
export class UserStatusCount extends Count {
  @Field((type) => UserStatus, { description: 'User status' })
  status!: UserStatus;
}

@ObjectType({ description: `User count by role` })
export class UserRoleCount extends Count {
  @Field((type) => UserRoleWithNone, { description: 'User role (include "None")' })
  userRole!: UserRole | 'none';
}

@ObjectType({ description: 'User meta' })
export class UserMeta extends Meta {
  @Field((type) => ID, { description: 'User id' })
  userId!: number;
}
