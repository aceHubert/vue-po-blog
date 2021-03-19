import { Field, InputType } from '@nestjs/graphql';
import { PostStatus } from '@/common/helpers/enums';

@InputType({ description: '页面修改模型' })
export class UpdatePageInput {
  @Field({ description: '标题' })
  title!: string;

  @Field({ description: '内容' })
  content!: string;

  @Field((type) => PostStatus, { nullable: true, description: '状态' })
  status?: PostStatus;
}
