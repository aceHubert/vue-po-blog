import { Field, ArgsType, ID } from '@nestjs/graphql';
import { PagedArgs } from '@/common/models/general.model';

/**
 * 评论查询分页参数
 */
@ArgsType()
export class PagedCommentArgs extends PagedArgs {
  @Field((type) => ID, { description: 'Post id' })
  postId!: number;

  @Field((type) => ID, { nullable: true, defaultValue: 0, description: 'Pagent id' })
  parentId!: number;
}

/** 评论查询嵌套参数 */
@ArgsType()
export class PagedCommentChildrenArgs extends PagedArgs {}
