import { Field, ObjectType, ID } from '@nestjs/graphql';
import { PagedResponse } from '@/common/models/general.model';
import { Meta } from '@/common/models/meta.model';
import { CommentType } from '../enums';

@ObjectType({ description: 'Comment model' })
export class Comment {
  @Field((type) => ID, { description: 'Comment Id' })
  id!: number;

  @Field((type) => ID, { description: 'Post Id' })
  postId!: number;

  @Field({ description: 'Username' })
  author!: string;

  @Field({ nullable: true, description: 'Comment user email' })
  authorEmail?: string;

  @Field({ nullable: true, description: 'Comment user client Url' })
  authorUrl?: string;

  @Field({ nullable: true, description: 'Comment user client IP' })
  authorIp?: string;

  @Field({ description: 'Content' })
  content!: string;

  @Field({ description: 'Approved' })
  approved!: boolean;

  @Field({ description: 'Edited' })
  edited!: boolean;

  @Field(() => CommentType, { description: 'Extended field: Type' })
  type!: CommentType;

  @Field({ nullable: true, description: 'Browser UserAgent' })
  agent?: string;

  @Field({ description: 'Update time' })
  updatedAt!: Date;

  @Field({ description: 'Creation time' })
  createdAt!: Date;
}

@ObjectType({ description: 'Comment paged model' })
export class PagedComment extends PagedResponse(Comment) {
  // other fields
}

@ObjectType({ description: 'Comment meta model' })
export class CommentMeta extends Meta {
  @Field((type) => ID, { description: 'Comment Id' })
  commentId!: number;
}
