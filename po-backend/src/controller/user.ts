import { Resolver, Query, Mutation, Arg, Args, Ctx, ID, Authorized } from 'type-graphql';
import { UserRole, UserStatus } from '@/dataSources';
import { createMetaResolver } from './meta';

// Types
import { Fields, ResolveTree } from '@/utils/fieldsDecorators';
import { DataSources } from '@/dataSources';
import User, {
  PagedUserQueryArgs,
  PagedUser,
  UserStatusCount,
  UserRoleCount,
  UserAddModel,
  UserUpdateModel,
  UserMeta,
  UserMetaAddModel,
} from '@/model/user';

@Resolver((returns) => User)
export default class UserResolver extends createMetaResolver(User, UserMeta, UserMetaAddModel, {
  name: '用户',
}) {
  @Authorized()
  @Query((returns) => User, { nullable: true, description: '获取用户' })
  user(@Fields() fields: ResolveTree, @Ctx('dataSources') { user }: DataSources) {
    return user.get(null, this.getFieldNames(fields.fieldsByTypeName.User));
  }

  @Authorized(UserRole.Administrator)
  @Query((returns) => User, { nullable: true, description: '获取用户(必须有编辑用户权限)' })
  userById(
    @Arg('id', (type) => ID!) id: number,
    @Fields() fields: ResolveTree,
    @Ctx('dataSources') { user }: DataSources,
  ) {
    return user.get(id, this.getFieldNames(fields.fieldsByTypeName.User));
  }

  @Authorized()
  @Query((returns) => PagedUser, { description: '获取用户分页列表' })
  users(@Args() args: PagedUserQueryArgs, @Fields() fields: ResolveTree, @Ctx('dataSources') { user }: DataSources) {
    return user.getPaged(
      args,
      this.getFieldNames(fields.fieldsByTypeName.PagedUser.rows.fieldsByTypeName.UserWithRole),
    );
  }

  @Query((returns) => [UserStatusCount], { description: '获取用户状态分组数量' })
  userCountByStatus(@Ctx('dataSources') { user }: DataSources) {
    return user.getCountByStatus();
  }

  @Query((returns) => [UserRoleCount], { description: '获取用户角色分组数量' })
  userCountByRole(@Ctx('dataSources') { user }: DataSources) {
    return user.getCountByRole();
  }

  @Query((returns) => Boolean, { description: '判断登录名是否存在' })
  isLoginNameExists(@Arg('loginName', (type) => String) loginName: string, @Ctx('dataSources') { user }: DataSources) {
    return user.isLoginNameExists(loginName);
  }

  @Query((returns) => Boolean, { description: '判断手机号码是否存在' })
  isMobileExists(@Arg('mobile', (type) => String) mobile: string, @Ctx('dataSources') { user }: DataSources) {
    return user.isMobileExists(mobile);
  }

  @Query((returns) => Boolean, { description: '判断email是否存在' })
  isEmailExists(@Arg('email', (type) => String) email: string, @Ctx('dataSources') { user }: DataSources) {
    return user.isEmailExists(email);
  }

  @Authorized()
  @Mutation((returns) => User, {
    nullable: true,
    description: '添加用户（如果登录名已在在，则返回 null；使用 "isLoginNameExists" 查询判断）',
  })
  addUser(@Arg('model', (type) => UserAddModel) model: UserAddModel, @Ctx('dataSources') { user }: DataSources) {
    return user.create(model);
  }

  @Authorized()
  @Mutation((returns) => Boolean, { description: '修改用户状态' })
  updateUser(
    @Arg('id', (type) => ID) id: number,
    @Arg('model', (type) => UserUpdateModel) model: UserUpdateModel,
    @Ctx('dataSources') { user }: DataSources,
  ) {
    return user.update(id, model);
  }

  @Authorized()
  @Mutation((returns) => Boolean, { description: '修改用户状态' })
  updateUserStatus(
    @Arg('id', (type) => ID, { description: 'User Id' }) id: number,
    @Arg('status', (type) => UserStatus) status: UserStatus,
    @Ctx('dataSources') { user }: DataSources,
  ) {
    return user.updateStatus(id, status);
  }

  @Authorized()
  @Mutation((returns) => Boolean, { description: '删除（永久）用户' })
  deleteUser(
    @Arg('id', (type) => ID, { description: 'User Id' }) id: number,
    @Ctx('dataSources') { user }: DataSources,
  ) {
    return user.delete(id);
  }
}
