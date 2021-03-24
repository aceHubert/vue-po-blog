import { ModuleRef } from '@nestjs/core';
import { Resolver, ResolveField, Query, Mutation, Root, Args, ID, Context } from '@nestjs/graphql';
import { UserStatus } from '@/common/helpers/enums';
import { createMetaResolver } from '@/common/resolvers/meta.resolver';
import { Fields, ResolveTree } from '@/common/decorators/field.decorator';
import { Authorized } from '@/common/decorators/authorized.decorator';
import { UserDataSource } from '@/sequelize-datasources/datasources';

// Types
import { NewUserInput } from './dto/new-user.input';
import { NewUserMetaInput } from './dto/new-user-meta.input';
import { PagedUserArgs } from './dto/paged-user.args';
import { UpdateUserInput } from './dto/update-user.input';
import { BaseUser, User, PagedUser, UserMeta, UserStatusCount, UserRoleCount } from './models/user.model';

@Resolver(() => BaseUser)
export class UserResolver extends createMetaResolver(BaseUser, UserMeta, NewUserMetaInput, UserDataSource, {
  resolverName: 'User',
  description: '用户',
}) {
  constructor(protected readonly moduleRef: ModuleRef, private readonly userDataSource: UserDataSource) {
    super(moduleRef);
  }

  @Authorized()
  @Query((returns) => User, { nullable: true, description: '获取当前用户' })
  user(@Fields() fields: ResolveTree, @Context('user') requestUser: JwtPayload): Promise<User | null> {
    return this.userDataSource.get(null, this.getFieldNames(fields.fieldsByTypeName.User), requestUser);
    // const fieldNames = this.getFieldNames(fields.fieldsByTypeName.User);
    // const user = await this.userDataSource.get(null, fieldNames, requestUser);
    // if (user) {
    //   if (fieldNames.includes('role')) {
    //     const role = await this.userDataSource.getRole(user.id);
    //     return { role: role as UserRole, ...user };
    //   } else {
    //     return { role: null, ...user };
    //   }
    // }
    // return null;
  }

  @Authorized()
  @Query((returns) => User, { nullable: true, description: '获取用户(必须有编辑用户权限)' })
  userById(
    @Args('id') id: number,
    @Fields() fields: ResolveTree,
    @Context('user') requestUser: JwtPayload,
  ): Promise<User | null> {
    return this.userDataSource.get(id, this.getFieldNames(fields.fieldsByTypeName.User), requestUser);
    // const fieldNames = this.getFieldNames(fields.fieldsByTypeName.User);
    // const user = await this.userDataSource.get(id, fieldNames, requestUser);
    // if (user) {
    //   if (fieldNames.includes('role')) {
    //     const role = await this.userDataSource.getRole(user.id);
    //     return { role: role as UserRole, ...user };
    //   } else {
    //     return { role: null, ...user };
    //   }
    // }
    // return null;
  }

  @Authorized()
  @Query((returns) => PagedUser, { description: '获取用户分页列表' })
  users(
    @Args() args: PagedUserArgs,
    @Fields() fields: ResolveTree,
    @Context('user') requestUser: JwtPayload,
  ): Promise<PagedUser> {
    return this.userDataSource.getPaged(
      args,
      this.getFieldNames(fields.fieldsByTypeName.PagedUser.rows.fieldsByTypeName.UserWithRole),
      requestUser,
    );
  }

  @Authorized()
  @ResolveField((type) => Boolean, { description: '是否是超级管理员' })
  isSuperAdmin(@Root() { loginName }: User) {
    return this.userDataSource.isSupurAdmin(loginName);
  }

  @Authorized()
  @Query((returns) => [UserStatusCount], { description: '获取用户状态分组数量' })
  userCountByStatus() {
    return this.userDataSource.getCountByStatus();
  }

  @Authorized()
  @Query((returns) => [UserRoleCount], { description: '获取用户角色分组数量' })
  userCountByRole() {
    return this.userDataSource.getCountByRole();
  }

  @Query((returns) => Boolean, { description: '判断登录名是否存在' })
  isLoginNameExists(@Args('loginName', { type: () => String }) loginName: string) {
    return this.userDataSource.isLoginNameExists(loginName);
  }

  @Query((returns) => Boolean, { description: '判断手机号码是否存在' })
  isMobileExists(@Args('mobile', { type: () => String }) mobile: string) {
    return this.userDataSource.isMobileExists(mobile);
  }

  @Query((returns) => Boolean, { description: '判断email是否存在' })
  isEmailExists(@Args('email', { type: () => String }) email: string) {
    return this.userDataSource.isEmailExists(email);
  }

  @Authorized()
  @Mutation((returns) => User, {
    nullable: true,
    description: '添加用户（如果登录名已在在，则返回 null；使用 "isLoginNameExists" 查询判断）',
  })
  addUser(@Args('model', { type: () => NewUserInput }) model: NewUserInput, @Context('user') requestUser: JwtPayload) {
    return this.userDataSource.create(model, requestUser);
  }

  @Authorized()
  @Mutation((returns) => Boolean, { description: '修改用户' })
  modifyUser(
    @Args('id', { type: () => ID, description: 'User Id' }) id: number,
    @Args('model', { type: () => UpdateUserInput }) model: UpdateUserInput,
    @Context('user') requestUser: JwtPayload,
  ) {
    return this.userDataSource.update(id, model, requestUser);
  }

  @Authorized()
  @Mutation((returns) => Boolean, { description: '修改用户状态' })
  modifyUserStatus(
    @Args('id', { type: () => ID, description: 'User Id' }) id: number,
    @Args('status', { type: () => UserStatus }) status: UserStatus,
    @Context('user') requestUser: JwtPayload,
  ) {
    return this.userDataSource.updateStatus(id, status, requestUser);
  }

  @Authorized()
  @Mutation((returns) => Boolean, { description: '删除用户（永久）' })
  removeUser(
    @Args('id', { type: () => ID, description: 'User Id' }) id: number,
    @Context('user') requestUser: JwtPayload,
  ) {
    return this.userDataSource.delete(id, requestUser);
  }
}
