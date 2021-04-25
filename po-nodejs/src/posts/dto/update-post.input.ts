import { Field, InputType, Int, PartialType, PickType } from '@nestjs/graphql';
import { PostStatus } from '../enums';
import { NewPostInput } from './new-post.input';

@InputType({ description: 'Update post input' })
export class UpdatePostInput extends PartialType(PickType(NewPostInput, ['title', 'content', 'excerpt'] as const)) {
  @Field((type) => PostStatus, { nullable: true, description: 'Post status' })
  status?: PostStatus;

  @Field((type) => Int, { nullable: true, description: 'Sort' })
  order?: number;
}
