import { Field, ObjectType, ID, Int } from '@nestjs/graphql';
import { PostStatus, PostCommentStatus } from '@/common/helpers/enums';
import { PagedResponse } from '@/common/models/general.model';

@ObjectType({ description: '页面模型' })
export class Page {
  @Field((type) => ID, { description: 'Id' })
  id!: number;

  @Field({ description: '标题' })
  title!: string;

  @Field({ description: '内容' })
  content!: string;

  @Field((type) => PostStatus, { description: '状态' })
  status!: PostStatus;

  @Field({ description: '排序' })
  order!: number;

  @Field((type) => PostCommentStatus, { description: '评论状态' })
  commentStatus!: PostCommentStatus;

  @Field((type) => Int, { description: '评论数量' })
  commentCount!: number;

  @Field({ description: '修改时间' })
  updatedAt!: Date;

  @Field({ description: '创建时间' })
  createdAt!: Date;
}

@ObjectType({ description: '页面分页模型' })
export class PagedPage extends PagedResponse(Page) {
  // other fields
}
