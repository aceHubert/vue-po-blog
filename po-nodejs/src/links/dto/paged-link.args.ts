import { Field, ArgsType } from '@nestjs/graphql';
import { PagedArgs } from '@/common/models/general.model';

/**
 * 链接查询分页参数
 */
@ArgsType()
export class PagedLinkArgs extends PagedArgs {
  @Field({ nullable: true, description: 'Search keyword (fuzzy searching from name)' })
  keyword?: string;
}
