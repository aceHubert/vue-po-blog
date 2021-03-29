import { Field, InputType } from '@nestjs/graphql';
import { PostCommentStatus } from '@/common/helpers/enums';
import { NewMetaInput } from '@/common/models/meta.model';

@InputType({ description: '文章新建模型' })
export class NewPostInput {
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

  @Field((type) => [NewMetaInput!], { nullable: true, description: '文章元数据' })
  metas?: NewMetaInput[];
}