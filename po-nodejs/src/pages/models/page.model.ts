import { Field, ObjectType, ID, Int } from '@nestjs/graphql';
import { PostStatus, PostCommentStatus } from '@/posts/enums';
import { PagedResponse } from '@/common/models/general.model';

@ObjectType({ description: 'Page model' })
export class Page {
  @Field((type) => ID, { description: 'Page id' })
  id!: number;

  @Field({ description: 'Title' })
  title!: string;

  @Field({ description: 'Content' })
  content!: string;

  @Field((type) => Int, { description: 'Order' })
  order!: number;

  @Field((type) => PostStatus, { description: 'Page status' })
  status!: PostStatus;

  @Field((type) => PostCommentStatus, { description: 'Comment status' })
  commentStatus!: PostCommentStatus;

  @Field((type) => Int, { description: 'Comment count' })
  commentCount!: number;

  @Field({ description: 'Update time' })
  updatedAt!: Date;

  @Field({ description: 'Creation time' })
  createdAt!: Date;
}

@ObjectType({ description: 'Paged page model' })
export class PagedPage extends PagedResponse(Page) {
  // other fields
}
