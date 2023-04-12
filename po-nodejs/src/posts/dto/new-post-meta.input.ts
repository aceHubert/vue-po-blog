import { Field, InputType, ID } from '@nestjs/graphql';
import { NewMetaInput } from '@/common/resolvers/dto/new-meta.input';

@InputType({ description: 'New post meta input' })
export class NewPostMetaInput extends NewMetaInput {
  @Field(() => ID, { description: 'Post Id' })
  postId!: number;
}
