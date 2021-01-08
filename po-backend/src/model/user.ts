import { Field, ObjectType, ArgsType, InputType, ID } from 'type-graphql';
import { Length, MinLength, IsEmail } from 'class-validator';
import { PagedQueryArgs, PagedResponse } from './general';
import Meta, { MetaAddModel } from './meta';
import { UserStatus } from './enums';

// Types
import { UserCreationAttributes } from '@/dataSources/entities/users';
import { UserMetaCreationAttributes } from '@/dataSources/entities/userMeta';

@ObjectType({ description: '用户模型' })
export default class User {
  @Field((type) => ID, { description: 'Id' })
  id!: number;

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

  @Field((type) => UserStatus, { description: '用户状态' })
  status!: UserStatus;

  @Field({ description: '修改时间' })
  updatedAt!: Date;

  @Field({ description: '创建时间' })
  createdAt!: Date;
}

/**
 * 用户查询分页参数
 */
@ArgsType()
export class PagedUserQueryArgs extends PagedQueryArgs {
  @Field((type) => UserStatus, { defaultValue: UserStatus.Enable, description: '用户状态' })
  status!: UserStatus;
}

@ObjectType({ description: '用户分页模型' })
export class PagedUser extends PagedResponse(User) {
  // other fields
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
  status?: UserStatus;

  @Field((type) => [MetaAddModel], { nullable: true, description: '页面元数据' })
  metas?: MetaAddModel[];
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

@InputType({ description: '用户登录模型' })
export class UserLoginModel {
  @Field({ description: '登录名' })
  loginName!: string;

  @Field({ description: '登录密码' })
  @MinLength(6, { message: '最小长度不得小于6位' })
  loginPwd!: string;
}
