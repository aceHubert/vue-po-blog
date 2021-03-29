import { Field, InputType, PartialType, PickType } from '@nestjs/graphql';
import { PostStatus } from '@/common/helpers/enums';
import { NewPageInput } from './new-page.input';

@InputType({ description: '页面修改模型' })
export class UpdatePageInput extends PartialType(PickType(NewPageInput, ['title', 'content'] as const)) {
  @Field((type) => PostStatus, { nullable: true, description: '状态' })
  status?: PostStatus;
}
