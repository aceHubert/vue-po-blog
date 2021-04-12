import { Field, InputType, PartialType, PickType } from '@nestjs/graphql';
import { PostStatus } from '@/common/helpers/enums';
import { NewPostInput } from './new-post.input';

@InputType({ description: '文章修改模型' })
export class UpdatePostInput extends PartialType(PickType(NewPostInput, ['title', 'content', 'excerpt'] as const)) {
  @Field((type) => PostStatus, { nullable: true, description: '状态' })
  status?: PostStatus;
}
