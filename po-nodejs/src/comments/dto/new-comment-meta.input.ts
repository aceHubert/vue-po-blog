import { Field, InputType, ID } from '@nestjs/graphql';
import { NewMetaInput } from '@/common/models/meta.model';

@InputType({ description: '评论元数据新建模型' })
export class NewCommentMetaInput extends NewMetaInput {
  @Field(() => ID, { description: 'Comment Id' })
  commentId!: number;
}
