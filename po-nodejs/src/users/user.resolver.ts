import { ModuleRef } from '@nestjs/core';
import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { I18n, I18nContext } from 'nestjs-i18n';
import { isEmail, isMobilePhone } from 'class-validator';
import { createMetaResolver } from '@/common/resolvers/meta.resolver';
import { Fields, ResolveTree } from '@/common/decorators/field.decorator';
import { Authorized } from '@/common/decorators/authorized.decorator';
import { User as RequestUser } from '@/common/decorators/user.decorator';
import { ArgValidateByPipe } from '@/common/pipes/arg-valitate-by.pipe';
import { ForbiddenError } from '@/common/utils/gql-errors.util';
import { UserDataSource } from '@/sequelize-datasources/datasources';
import { UserRole } from './enums/user-role.enum';
import { UserStatus } from './enums/user-status.enum';

// Types
import { NewUserInput } from './dto/new-user.input';
import { NewUserMetaInput } from './dto/new-user-meta.input';
import { PagedUserArgs } from './dto/paged-user.args';
import { UpdateUserInput } from './dto/update-user.input';
import { BaseUser, User, PagedUser, UserMeta, UserStatusCount, UserRoleCount } from './models/user.model';

@Resolver(() => BaseUser)
export class UserResolver extends createMetaResolver(BaseUser, UserMeta, NewUserMetaInput, UserDataSource, {
  resolverName: 'User',
  descriptionName: 'user',
}) {
  constructor(protected readonly moduleRef: ModuleRef, private readonly userDataSource: UserDataSource) {
    super(moduleRef);
  }

  @Authorized()
  @Query((returns) => User, { nullable: true, description: 'Get current user info.' })
  user(@Fields() fields: ResolveTree, @RequestUser() requestUser: JwtPayloadWithLang): Promise<User | null> {
    return this.userDataSource.get(null, this.getFieldNames(fields.fieldsByTypeName.User), requestUser);
  }

  @Authorized()
  @Query((returns) => User, {
    nullable: true,
    description: 'Get user info by id (only user with "edit_users" capability is allowed for this action).',
  })
  userById(
    @Args('id', { type: () => ID }) id: number,
    @Fields() fields: ResolveTree,
    @RequestUser() requestUser: JwtPayloadWithLang,
  ): Promise<User | null> {
    return this.userDataSource.get(id, this.getFieldNames(fields.fieldsByTypeName.User), requestUser);
  }

  @Authorized()
  @Query((returns) => PagedUser, { description: 'Get users.' })
  users(
    @Args() args: PagedUserArgs,
    @Fields() fields: ResolveTree,
    @RequestUser() requestUser: JwtPayloadWithLang,
  ): Promise<PagedUser> {
    return this.userDataSource.getPaged(
      args,
      this.getFieldNames(fields.fieldsByTypeName.PagedUser.rows.fieldsByTypeName.UserWithRole),
      requestUser,
    );
  }

  @Authorized()
  @Query((returns) => [UserStatusCount], { description: 'Get user count by status.' })
  userCountByStatus() {
    return this.userDataSource.getCountByStatus();
  }

  @Authorized()
  @Query((returns) => [UserRoleCount], { description: 'Get user count by role' })
  userCountByRole() {
    return this.userDataSource.getCountByRole();
  }

  @Query((returns) => Boolean, { description: 'Is login name exists?' })
  isLoginNameExists(@Args('loginName', { type: () => String }) loginName: string): Promise<boolean> {
    return this.userDataSource.isLoginNameExists(loginName);
  }

  @Query((returns) => Boolean, { description: 'Is mobile number exists?' })
  isMobileExists(
    @Args(
      'mobile',
      { type: () => String },
      new ArgValidateByPipe({ validate: isMobilePhone, args: [], message: 'mobile format is incorrect' }),
    )
    mobile: string,
  ): Promise<boolean> {
    return this.userDataSource.isMobileExists(mobile);
  }

  @Query((returns) => Boolean, { description: 'Is email exists?' })
  isEmailExists(
    @Args(
      'email',
      { type: () => String },
      new ArgValidateByPipe({ validate: isEmail, args: [], message: 'email format is incorrect' }),
    )
    email: string,
  ): Promise<boolean> {
    return this.userDataSource.isEmailExists(email);
  }

  @Authorized()
  @Mutation((returns) => User, { description: 'Create a new user.' })
  async createUser(
    @Args('model', { type: () => NewUserInput }) model: NewUserInput,
    @RequestUser() requestUser: JwtPayloadWithLang,
  ): Promise<User> {
    const { sendUserNotification, ...newUser } = model;
    const user = await this.userDataSource.create(newUser, requestUser);
    if (sendUserNotification) {
      // todo: send email
    }
    return user;
  }

  @Authorized()
  @Mutation((returns) => Boolean, { description: 'Update user info.' })
  async updateUser(
    @Args('id', { type: () => ID, description: 'User id' }) id: number,
    @Args('model') model: UpdateUserInput,
    @RequestUser() requestUser: JwtPayloadWithLang,
    @I18n() i18n: I18nContext,
  ): Promise<boolean> {
    if (model.userRole && requestUser.role !== UserRole.Administrator) {
      throw new ForbiddenError(
        await i18n.tv(
          'error.forbidden_role',
          `Access denied, You don't have permission (role "${UserRole.Administrator}" required) for this action!`,
          {
            args: {
              userRole: requestUser.role,
              requiredRole: UserRole.Administrator,
            },
          },
        ),
      );
    }
    return this.userDataSource.update(id, model, requestUser);
  }

  @Authorized()
  @Mutation((returns) => Boolean, { description: 'Update user status.' })
  updateUserStatus(
    @Args('id', { type: () => ID, description: 'User id' }) id: number,
    @Args('status', { type: () => UserStatus }) status: UserStatus,
    @RequestUser() requestUser: JwtPayloadWithLang,
  ): Promise<boolean> {
    return this.userDataSource.updateStatus(id, status, requestUser);
  }

  @Authorized()
  @Mutation((returns) => Boolean, { description: 'Delete user permanently.' })
  deleteUser(
    @Args('id', { type: () => ID, description: 'User id' }) id: number,
    @RequestUser() requestUser: JwtPayloadWithLang,
  ): Promise<boolean> {
    return this.userDataSource.delete(id, requestUser);
  }

  @Authorized()
  @Mutation((returns) => Boolean, { description: 'Delete bulk of users permanently.' })
  bulkDeleteUsers(
    @Args('ids', { type: () => [ID!], description: 'User ids' }) ids: number[],
    @RequestUser() requestUser: JwtPayloadWithLang,
  ): Promise<boolean> {
    return this.userDataSource.bulkDelete(ids, requestUser);
  }
}
