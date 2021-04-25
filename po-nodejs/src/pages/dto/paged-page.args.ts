import { Field, ArgsType } from '@nestjs/graphql';
import { PagedArgs } from '@/common/models/general.model';
import { PostStatus } from '@/posts/enums';

/**
 * 页面分页查询参数
 */
@ArgsType()
export class PagedPageArgs extends PagedArgs {
  @Field({ nullable: true, description: 'Search keyword (fuzzy searching from title)' })
  keyword?: string;

  @Field({ nullable: true, description: 'Author id' })
  author?: number;

  @Field((type) => PostStatus, { nullable: true, description: 'Page status' })
  status?: PostStatus;

  @Field({ nullable: true, description: 'Date (format: yyyyMM)' })
  date?: string;
}
