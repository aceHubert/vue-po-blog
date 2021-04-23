import { Field, ArgsType } from '@nestjs/graphql';
import { PagedArgs } from '@/common/models/general.model';
import { UserStatus, UserRoleWithNone, UserRole } from '../enums';

// Types
import { PagedUserArgs as IPagedUserArgs } from '@/sequelize-datasources/interfaces';

/**
 * 用户查询分页参数
 */
@ArgsType()
export class PagedUserArgs extends PagedArgs implements IPagedUserArgs {
  @Field({ nullable: true, description: 'Search keyword（from loginName）' })
  keyword?: string;

  @Field((type) => UserStatus, { nullable: true, description: 'User status' })
  status?: UserStatus;

  @Field((type) => UserRoleWithNone, {
    nullable: true,
    description: "User role（if null，search for all roles but not 'None'",
  })
  userRole?: UserRole | 'none';
}
