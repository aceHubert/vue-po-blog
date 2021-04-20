import { Field, ObjectType, InterfaceType, ID, createUnionType } from '@nestjs/graphql';
import { FieldAuthorized } from '@/common/decorators/authorized.decorator';
import { PagedResponse, Count } from '@/common/models/general.model';
import { Meta } from '@/common/models/meta.model';
import { UserRole, UserRoleWithNone, UserStatus } from '../enums';

@InterfaceType()
export abstract class BaseUser {
  @Field((type) => ID, { description: 'Id' })
  id!: number;

  @Field({ description: '登录名' })
  @FieldAuthorized(UserRole.Administrator)
  loginName!: string;

  @Field({ description: '显示名称' })
  displayName!: string;

  @Field((type) => String, { nullable: true, description: '手机号码' })
  mobile!: string | null;

  @Field({ description: '电子邮箱' })
  email!: string;

  @Field((type) => String, { nullable: true, description: '客户端的 URL' })
  url!: string | null;

  @Field((type) => UserStatus, { description: '用户状态' })
  status!: UserStatus;

  @Field({ description: '修改时间' })
  updatedAt!: Date;

  @Field({ description: '创建时间' })
  createdAt!: Date;
}

@ObjectType({ implements: BaseUser, description: '用户模型' })
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

@ObjectType({ implements: BaseUser, description: '用户模型（包含角色）' })
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

  @Field((type) => UserRole, { nullable: true, description: '用户角色' })
  userRole?: UserRole;
}

@ObjectType({ description: '基本用户信息' })
export class SimpleUser {
  @Field((type) => ID, { description: 'Id' })
  id!: number;

  @Field({ description: '显示名称' })
  displayName!: string;

  @Field({ description: '电子邮箱' })
  email!: string;
}

@ObjectType({ description: '用户分页模型' })
export class PagedUser extends PagedResponse(UserWithRole) {
  // other fields
}

@ObjectType({ description: `用户按状态分组数量模型` })
export class UserStatusCount extends Count {
  @Field((type) => UserStatus, { description: '状态' })
  status!: UserStatus;
}

@ObjectType({ description: `用户按角色分组数量模型` })
export class UserRoleCount extends Count {
  @Field((type) => UserRoleWithNone, { description: '角色' })
  userRole!: UserRole | 'none';
}

@ObjectType({ description: '用户元数据模型' })
export class UserMeta extends Meta {
  @Field((type) => ID, { description: 'User Id' })
  userId!: number;
}

@ObjectType({ description: '返回是否成功' })
abstract class IsSuccessResponse<S extends boolean> {
  @Field({ description: '登录是否成功' })
  success!: S;
}

@ObjectType({ description: '用户登录成功返回模型' })
class UserLoginSuccessResponse extends IsSuccessResponse<true> {
  @Field({ description: 'Token' })
  token!: string;
}

@ObjectType({ description: '用户登录失败返回模型' })
class UserLoginFailedResponse extends IsSuccessResponse<false> {
  @Field({ description: 'Message' })
  message!: string;
}

export const UserLoginUnionResponse = createUnionType({
  name: 'UserLoginUnionType',
  description: '用户登录返回模型',
  types: () => [UserLoginSuccessResponse, UserLoginFailedResponse],
  resolveType: (value) => {
    if (value.success) {
      return UserLoginSuccessResponse;
    } else {
      return UserLoginFailedResponse;
    }
  },
});

@ObjectType({ description: '用户登录成功返回模型' })
class RefreshTokenSuccessResponse extends IsSuccessResponse<true> {
  @Field({ description: 'Token' })
  token!: string;
}

@ObjectType({ description: '用户登录失败返回模型' })
class RefreshTokenFailedResponse extends IsSuccessResponse<false> {
  @Field({ description: 'Message' })
  message!: string;
}

export const RefreshTokenUnionResponse = createUnionType({
  name: 'RefreshTokenUnionType',
  description: '更新 Token 返回模型',
  types: () => [RefreshTokenSuccessResponse, RefreshTokenFailedResponse],
  resolveType: (value) => {
    if (value.success) {
      return RefreshTokenSuccessResponse;
    } else {
      return RefreshTokenFailedResponse;
    }
  },
});
