import { Field, ArgsType } from '@nestjs/graphql';
import { PagedArgs } from '@/common/models/general.model';
import { UserStatus, UserRoleWithNone } from '@/common/helpers/enums';

/**
 * 用户查询分页参数
 */
@ArgsType()
export class PagedUserArgs extends PagedArgs {
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
