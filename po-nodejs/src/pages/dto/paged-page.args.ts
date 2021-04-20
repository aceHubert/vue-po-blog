import { Field, ArgsType } from '@nestjs/graphql';
import { PagedArgs } from '@/common/models/general.model';
import { PostStatus } from '@/posts/enums';

/**
 * 页面分页查询参数
 */
@ArgsType()
export class PagedPageArgs extends PagedArgs {
  @Field({ nullable: true, description: '搜索关键字（根据标题模糊查询）' })
  keyword?: string;

  @Field({ nullable: true, description: '文章作者' })
  author?: number;

  @Field((type) => PostStatus, { nullable: true, description: '页面状态' })
  status?: PostStatus;

  @Field({ nullable: true, description: '日期，格式：yyyy-MM' })
  date?: string;
}
