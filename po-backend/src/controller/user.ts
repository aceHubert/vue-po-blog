import { Resolver, Query, Mutation, Authorized, Arg, Args, Ctx, ID } from 'type-graphql';
import { AuthenticationError } from 'apollo-server-express';
import jwt from 'jsonwebtoken';
import { configs } from '@/utils/getConfig';
import { createMetaResolver } from './meta';

// Types
import { Fields, ResolveTree } from '@/utils/fieldsDecorators';
import { DataSources } from '@/dataSources';
import User, {
  PagedUserQueryArgs,
  PagedUser,
  UserAddModel,
  UserUpdateModel,
  UserLoginModel,
  UserMeta,
  UserMetaAddModel,
} from '@/model/user';
import { UserStatus } from '@/model/enums';

@Resolver((returns) => User)
export default class UserResolver extends createMetaResolver(User, UserMeta, UserMetaAddModel, {
  name: '用户',
}) {
  @Authorized('Admin')
  @Query((returns) => User, { nullable: true, description: '获取用户' })
  user(@Arg('id', (type) => ID!) id: number, @Fields() fields: ResolveTree, @Ctx('dataSources') { user }: DataSources) {
    return user.get(id, Object.keys(fields.fieldsByTypeName.User));
  }

  @Authorized('Admin')
  @Query((returns) => PagedUser, { description: '获取用户分页列表' })
  users(@Args() args: PagedUserQueryArgs, @Fields() fields: ResolveTree, @Ctx('dataSources') { user }: DataSources) {
    return user.getPaged(args, Object.keys(fields.fieldsByTypeName.PagedUser.rows.fieldsByTypeName.User));
  }

  @Query((returns) => Boolean, { description: '判断登录名是否存在' })
  isLoginNameExists(@Arg('loginName', (type) => String) loginName: string, @Ctx('dataSources') { user }: DataSources) {
    return user.isExists(loginName);
  }

  @Authorized('Admin')
  @Mutation((returns) => User, {
    nullable: true,
    description: '添加用户（如果登录名已在在，则返回 null；使用 "isLoginNameExists" 查询判断）',
  })
  addUser(@Arg('model', (type) => UserAddModel) model: UserAddModel, @Ctx('dataSources') { user }: DataSources) {
    return user.create(model);
  }

  @Mutation((returns) => String, { description: '登录方法' })
  login(@Arg('model', (type) => UserLoginModel) model: UserLoginModel, @Ctx('dataSources') { user }: DataSources) {
    return user.login(model).then((payload) => {
      if (payload) {
        return jwt.sign(payload, configs.get('jwt_screct'), {
          algorithm: configs.get('jwt_algorithm'),
          expiresIn: configs.get('jwt_expiresIn'),
        });
      } else {
        throw new AuthenticationError('Login Unsuccessfly');
      }
    });
  }

  @Authorized('Admin')
  @Mutation((returns) => Boolean, { description: '修改用户状态' })
  updateUser(
    @Arg('id', (type) => ID) id: number,
    @Arg('model', (type) => UserUpdateModel) model: UserUpdateModel,
    @Ctx('dataSources') { user }: DataSources,
  ) {
    return user.update(id, model);
  }

  @Authorized('Admin')
  @Mutation((returns) => Boolean, { description: '修改用户状态' })
  updateUserStatus(
    @Arg('id', (type) => ID) id: number,
    @Arg('status', (type) => UserStatus) status: UserStatus,
    @Ctx('dataSources') { user }: DataSources,
  ) {
    return user.updateStatus(id, status);
  }
}
