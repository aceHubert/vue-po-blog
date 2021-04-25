import { Field, ObjectType, ID, Int } from '@nestjs/graphql';
import { PagedResponse, Count } from '@/common/models/general.model';
import { Meta } from '@/common/models/meta.model';
import { PostStatus, PostCommentStatus } from '../enums';

@ObjectType({ description: '文章模型' })
export class Post {
  @Field((type) => ID, { description: 'Id' })
  id!: number;

  @Field({ description: '标题' })
  title!: string;

  @Field({ description: '内容' })
  content!: string;

  @Field({ description: '摘要' })
  excerpt!: string;

  @Field((type) => PostStatus, { description: '状态' })
  status!: PostStatus;

  @Field((type) => PostCommentStatus, { description: '评论状态' })
  commentStatus!: PostCommentStatus;

  @Field((type) => Int, { description: '评论数量' })
  commentCount!: number;

  @Field({ description: '修改时间' })
  updatedAt!: Date;

  @Field({ description: '创建时间' })
  createdAt!: Date;
}

@ObjectType({ description: '文章分页模型' })
export class PagedPost extends PagedResponse(Post) {
  // other fields
}

@ObjectType({ description: '文章按状态分组数量模型' })
export class PostStatusCount extends Count {
  @Field((type) => PostStatus, { description: '文章状态' })
  status!: PostStatus;
}

@ObjectType({ description: `文章按天分组数量模型` })
export class PostDayCount extends Count {
  @Field({ description: '日期，格式：yyyyMMdd' })
  day!: string;
}

@ObjectType({ description: `文章按月分组数量模型` })
export class PostMonthCount extends Count {
  @Field({ description: '日期，格式：yyyyMM' })
  month!: string;
}

@ObjectType({ description: `文章按年分组数量模型` })
export class PostYearCount extends Count {
  @Field({ description: '日期，格式：yyyy' })
  year!: string;
}

@ObjectType({ description: '文章元数据模型' })
export class PostMeta extends Meta {
  @Field((type) => ID, { description: 'Post Id' })
  postId!: number;
}
