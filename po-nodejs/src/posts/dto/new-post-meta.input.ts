import { Field, InputType, ID } from '@nestjs/graphql';
import { NewMetaInput } from '@/common/models/meta.model';

@InputType({ description: 'New post meta input' })
export class NewPostMetaInput extends NewMetaInput {
  @Field(() => ID, { description: 'Post Id' })
  postId!: number;
}
