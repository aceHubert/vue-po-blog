import { Field, InputType, ID } from '@nestjs/graphql';
import { NewMetaInput } from '@/common/models/meta.model';

@InputType({ description: 'New comment meta input' })
export class NewCommentMetaInput extends NewMetaInput {
  @Field(() => ID, { description: 'Comment id' })
  commentId!: number;
}
