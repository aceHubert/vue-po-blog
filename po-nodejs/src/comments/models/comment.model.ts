import { Field, ObjectType, ID } from '@nestjs/graphql';
import { PagedResponse } from '@/common/models/general.model';
import { Meta } from '@/common/models/meta.model';
import { CommentType } from '../enums';

@ObjectType({ description: '评论模型' })
export class Comment {
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

@ObjectType({ description: '评论分页模型' })
export class PagedComment extends PagedResponse(Comment) {
  // other fields
}

@ObjectType({ description: '评论元数据模型' })
export class CommentMeta extends Meta {
  @Field((type) => ID, { description: 'Comment Id' })
  commentId!: number;
}
