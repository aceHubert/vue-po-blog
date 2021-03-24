import { Field, InputType } from '@nestjs/graphql';
import { PostStatus, PostCommentStatus } from '@/common/helpers/enums';

@InputType({ description: '文章修改模型' })
export class UpdatePostInput {
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
