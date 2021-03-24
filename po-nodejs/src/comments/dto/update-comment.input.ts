import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: '评论新建模型' })
export class UpdateCommentInput {
  @Field({ description: '内容' })
  content!: string;
}
