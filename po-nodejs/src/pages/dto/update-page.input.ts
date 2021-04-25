import { Field, InputType, Int, PartialType, PickType } from '@nestjs/graphql';
import { PostStatus } from '@/posts/enums';
import { NewPageInput } from './new-page.input';

@InputType({ description: 'Update page input' })
export class UpdatePageInput extends PartialType(PickType(NewPageInput, ['title', 'content'] as const)) {
  @Field((type) => PostStatus, { nullable: true, description: 'Page status' })
  status?: PostStatus;

  @Field((type) => Int, { nullable: true, description: 'Sort' })
  order?: number;
}
