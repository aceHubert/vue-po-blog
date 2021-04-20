import { Field, ArgsType, ID } from '@nestjs/graphql';
import { PagedArgs } from '@/common/models/general.model';
import { PostStatus } from '../enums';

/**
 * 文章分页查询参数
 */
@ArgsType()
export class PagedPostArgs extends PagedArgs {
  @Field({ nullable: true, description: '搜索关键字（根据标题模糊查询）' })
  keyword?: string;

  @Field({ nullable: true, description: '文章作者' })
  author?: number;

  @Field((type) => PostStatus, { nullable: true, description: '文章状态(如果为空，则搜索状态为非 Trash 的文章)' })
  status?: PostStatus;

  @Field((type) => ID, { nullable: true, description: '类别 Id（termId），不可和标签同时出现在过滤条件' })
  categoryId?: number;

  @Field({ nullable: true, description: '类别名称(不可和 categoryId 同时出现)' })
  categoryName?: string;

  @Field((type) => ID, { nullable: true, description: '标签 Id（termId），不可和类别同时出现在过滤条件，分类优先' })
  tagId?: number;

  @Field({ nullable: true, description: '标签名称(不可和 tagId 同时出现)' })
  tagName?: string;

  @Field({ nullable: true, description: '日期，格式：yyyy(年)、yyyyMM(月)、yyyyMMdd(日)' })
  date?: string;
}
