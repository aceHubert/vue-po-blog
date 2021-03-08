import { Field, ObjectType, ArgsType, InputType, ID } from 'type-graphql';
import { CommentType } from '@/dataSources';
import { PagedQueryArgs, PagedResponse } from './general';
import Meta, { MetaAddModel } from './meta';

// Types
import { CommentCreationAttributes } from '@/dataSources/entities/comments';
import { CommentMetaCreationAttributes } from '@/dataSources/entities/commentMeta';

@ObjectType({ description: '评论模型' })
export default class Comment {
  @Field((type) => ID, { description: 'Id' })
  id!: number;

  @Field((type) => ID, { description: '文章 Id' })
  postId!: number;

  @Field({ description: '评论人' })
  author!: string;

  @Field({ nullable: true, description: '评论人 Email' })
  authorEmail?: string;

  @Field({ nullable: true, description: '评论人客户端 Url' })
  authorUrl?: string;

  @Field({ nullable: true, description: '评论人客户端 IP' })
  authorIP?: string;

  @Field({ description: '评论内容' })
  content!: string;

  @Field({ description: '审核是否通过' })
  approved!: boolean;

  @Field({ description: '是否重新编译' })
  edited!: boolean;

  @Field(() => CommentType, { description: '扩展字段：类型' })
  type!: CommentType;

  @Field({ nullable: true, description: '浏览器 UserAgent' })
  agent?: string;

  @Field({ description: '修改时间' })
  updatedAt!: Date;

  @Field({ description: '创建时间' })
  createdAt!: Date;
}

/**
 * 评论查询分页参数
 */
@ArgsType()
export class PagedCommentQueryArgs extends PagedQueryArgs {
  @Field((type) => ID, { description: '文章 Id' })
  postId!: number;

  @Field((type) => ID, { nullable: true, defaultValue: 0, description: '父 Id' })
  parentId!: number;
}

/** 评论查询嵌套参数 */
@ArgsType()
export class ChildPagedCommentQueryArgs extends PagedQueryArgs {}

@ObjectType({ description: '评论分页模型' })
export class PagedComment extends PagedResponse(Comment) {
  // other fields
}

@ObjectType({ description: '评论元数据模型' })
export class CommentMeta extends Meta {
  @Field((type) => ID, { description: 'Comment Id' })
  commentId!: number;
}

@InputType({ description: '评论元数据新建模型' })
export class CommentMetaAddModel extends MetaAddModel implements CommentMetaCreationAttributes {
  @Field(() => ID, { description: 'Comment Id' })
  commentId!: number;
}

@InputType({ description: '评论新建模型' })
export class CommentAddModel implements CommentCreationAttributes {
  @Field(() => ID, { description: '文章 Id' })
  postId!: number;

  @Field({ description: '评论人' })
  author!: string;

  @Field({ nullable: true, description: '评论人 Email' })
  authorEmail?: string;

  @Field({ nullable: true, description: '评论人客户端 Url' })
  authorUrl?: string;

  @Field({ nullable: true, description: '评论人客户端 IP' })
  authorIP?: string;

  @Field({ description: '内容' })
  content!: string;

  @Field({ nullable: true, description: '浏览器 UserAgent' })
  agent?: string;

  @Field((type) => ID, { nullable: true, description: '父 Id' })
  parentId?: number;

  @Field((type) => ID, { nullable: true, description: '登录用户 Id' })
  userId?: number;

  @Field((type) => [MetaAddModel], { nullable: true, description: '文章元数据' })
  metas?: MetaAddModel[];
}

@InputType({ description: '评论新建模型' })
export class CommentUpdateModel {
  @Field({ description: '内容' })
  content!: string;
}
