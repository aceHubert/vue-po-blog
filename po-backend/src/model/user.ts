import { Field, ObjectType, ArgsType, InputType, ID, createUnionType, Authorized } from 'type-graphql';
import { Length, MinLength, IsEmail } from 'class-validator';
import { UserStatus, UserRole, UserRoleWithNone } from '@/dataSources';
import { PagedQueryArgs, PagedResponse, Count } from './general';
import Meta, { MetaAddModel } from './meta';

// Types
import { UserCreationAttributes } from '@/dataSources/entities/users';
import { UserMetaCreationAttributes } from '@/dataSources/entities/userMeta';

@ObjectType({ description: '用户模型' })
export default class User {
  @Field((type) => ID, { description: 'Id' })
  id!: number;

  @Authorized(UserRole.Administrator)
  @Field({ description: '登录名' })
  loginName!: string;

  @Field({ description: '昵称' })
  niceName!: string;

  @Field({ description: '前台显示名称' })
  displayName!: string;

  @Field((type) => String, { nullable: true, description: '手机号码' })
  mobile!: string | null;

  @Field({ description: '电子邮箱' })
  email!: string;

  @Field({ description: '注册时客户端的 URL' })
  url!: string;

  @Authorized(UserRole.Administrator)
  @Field((type) => UserStatus, { description: '用户状态' })
  status!: UserStatus;

  @Field({ description: '修改时间' })
  updatedAt!: Date;

  @Field({ description: '创建时间' })
  createdAt!: Date;
}

@ObjectType({ description: '用户模型(包含角色)' })
export class UserWithRole extends User {
  @Field((type) => UserRoleWithNone, { nullable: true, description: '用户角色(包含 None)' })
  role!: UserRoleWithNone;
}

/**
 * 用户查询分页参数
 */
@ArgsType()
export class PagedUserQueryArgs extends PagedQueryArgs {
  @Field({ nullable: true, description: '搜索关键字（根据登录名模糊查询）' })
  keyword?: string;

  @Field((type) => UserStatus, { nullable: true, description: '用户状态' })
  status!: UserStatus;

  @Field((type) => UserRoleWithNone, {
    nullable: true,
    description: '用户角色（如果为空，则查询有角色（即非 None 的）的用户）',
  })
  role?: UserRoleWithNone;
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
  role!: UserRoleWithNone;
}

@ObjectType({ description: '用户元数据模型' })
export class UserMeta extends Meta {
  @Field((type) => ID, { description: 'User Id' })
  userId!: number;
}

@InputType({ description: '用户元数据新建模型' })
export class UserMetaAddModel extends MetaAddModel implements UserMetaCreationAttributes {
  @Field(() => ID, { description: 'User Id' })
  userId!: number;
}

@InputType({ description: '用户新建模型' })
export class UserAddModel implements UserCreationAttributes {
  @Field({ description: '登录名' })
  loginName!: string;

  @Field({ description: '登录密码' })
  @MinLength(6, { message: '最小长度不得小于6位' })
  loginPwd!: string;

  @Field({ nullable: true, description: '昵称，不填则使用登录名' })
  niceName?: string;

  @Field({ nullable: true, description: '前台显示名称，不填则使用登录名' })
  displayName?: string;

  @Field({ nullable: true, description: '手机号码' })
  @Length(11, 11, { message: '手机号码长度为11位' })
  mobile?: string;

  @Field({ description: 'Email' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  email!: string;

  @Field({ description: '客户端 URL' })
  url!: string;

  @Field(() => UserStatus, { defaultValue: UserStatus.Enable, description: '状态' })
  status!: UserStatus;

  @Field(() => UserRole, { defaultValue: UserRole.Subscriber, description: '角色' })
  role!: UserRole;
}

@InputType({ description: '用户修改模型' })
export class UserUpdateModel {
  @Field({ nullable: true, description: '昵称' })
  niceName?: string;

  @Field({ nullable: true, description: '前台显示名称' })
  displayName?: string;

  @Field({ nullable: true, description: '手机号码' })
  @Length(11, 11, { message: '手机号码长度为11位' })
  mobile?: string;

  @Field({ nullable: true, description: 'Email' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  email!: string;
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
  types: () => [UserLoginSuccessResponse, UserLoginFailedResponse] as const,
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
  types: () => [RefreshTokenSuccessResponse, RefreshTokenFailedResponse] as const,
  resolveType: (value) => {
    if (value.success) {
      return RefreshTokenSuccessResponse;
    } else {
      return RefreshTokenFailedResponse;
    }
  },
});
