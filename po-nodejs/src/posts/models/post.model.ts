import { Field, ObjectType, ID, Int } from '@nestjs/graphql';
import { PagedResponse, Count } from '@/common/models/general.model';
import { Meta } from '@/common/models/meta.model';
import { PostStatus, PostCommentStatus } from '../enums';

@ObjectType({ description: 'Post model' })
export class Post {
  @Field((type) => ID, { description: 'Post id' })
  id!: number;

  @Field({ description: 'Title' })
  title!: string;

  @Field({ description: 'Content' })
  content!: string;

  @Field({ description: 'Excerpt' })
  excerpt!: string;

  @Field((type) => PostStatus, { description: 'Post status' })
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

@ObjectType({ description: 'Paged post model' })
export class PagedPost extends PagedResponse(Post) {
  // other fields
}

@ObjectType({ description: 'Post count by status' })
export class PostStatusCount extends Count {
  @Field((type) => PostStatus, { description: 'Post staus' })
  status!: PostStatus;
}

@ObjectType({ description: `Post count by day` })
export class PostDayCount extends Count {
  @Field({ description: 'Day (format: yyyyMMdd)' })
  day!: string;
}

@ObjectType({ description: `Post count by month` })
export class PostMonthCount extends Count {
  @Field({ description: 'Month (format: yyyyMM)' })
  month!: string;
}

@ObjectType({ description: `Post count by year` })
export class PostYearCount extends Count {
  @Field({ description: 'Year (format: yyyy)' })
  year!: string;
}

@ObjectType({ description: 'Post meta' })
export class PostMeta extends Meta {
  @Field((type) => ID, { description: 'Post id' })
  postId!: number;
}
