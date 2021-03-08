import { Field, ObjectType, ArgsType, InputType, ID, Int } from 'type-graphql';
import { PostStatus, PostCommentStatus } from '@/dataSources';
import { PagedQueryArgs, PagedResponse, Count } from './general';
import Meta, { MetaAddModel } from './meta';

// Types
import { PostCreationAttributes } from '@/dataSources/entities/posts';
import { PostMetaCreationAttributes } from '@/dataSources/entities/postMeta';

@ObjectType({ description: '文章模型' })
export default class Post {
  @Field((type) => ID, { description: 'Id' })
  id!: number;

  @Field({ description: '标题' })
  title!: string;

  @Field({ description: '内容' })
  content!: string;

  @Field({ nullable: true, description: '摘要' })
  excerpt?: string;

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

/**
 * 文章分页查询参数
 */
@ArgsType()
export class PagedPostQueryArgs extends PagedQueryArgs {
  @Field({ nullable: true, description: '搜索关键字（根据标题模糊查询）' })
  keyword?: string;

  @Field({ nullable: true, description: '文章作者' })
  author?: number;

  @Field((type) => PostStatus, { nullable: true, description: '文章状态(如果为空，则搜索状态为非 Trash 的文章)' })
  status?: PostStatus;

  @Field((type) => [ID!], { nullable: true, description: '类别 Id' })
  categoryIds?: number[];

  @Field({ nullable: true, description: '日期，格式：yyyy(年)、yyyyMM(月)、yyyyMMdd(日)' })
  date?: string;
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

@InputType({ description: '文章元数据新建模型' })
export class PostMetaAddModel extends MetaAddModel implements PostMetaCreationAttributes {
  @Field(() => ID, { description: 'Post Id' })
  postId!: number;
}

@InputType({ description: '文章新建模型' })
export class PostAddModel implements PostCreationAttributes {
  @Field({ description: '标题' })
  title!: string;

  @Field({ nullable: true, description: '唯一标识，用于 Url 显示' })
  name?: string;

  @Field({ description: '内容' })
  content!: string;

  @Field({ nullable: true, description: '摘要' })
  excerpt?: string;

  @Field((type) => PostCommentStatus, { nullable: true, description: '评论状态' })
  commentStatus?: PostCommentStatus;

  @Field((type) => [MetaAddModel], { nullable: true, description: '文章元数据' })
  metas?: MetaAddModel[];
}

@InputType({ description: '文章修改模型' })
export class PostUpdateModel {
  @Field({ description: '标题' })
  title!: string;

  @Field({ description: '内容' })
  content!: string;

  @Field({ nullable: true, description: '摘要' })
  excerpt?: string;

  @Field((type) => PostStatus, { nullable: true, description: '状态' })
  status?: PostStatus;

  @Field((type) => PostCommentStatus, { nullable: true, description: '评论状态' })
  commentStatus?: PostCommentStatus;
}
