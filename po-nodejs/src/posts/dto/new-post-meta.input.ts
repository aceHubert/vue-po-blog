import { Field, InputType, ID } from '@nestjs/graphql';
import { NewMetaInput } from '@/common/models/meta.model';

@InputType({ description: '文章元数据新建模型' })
export class NewPostMetaInput extends NewMetaInput {
  @Field(() => ID, { description: 'Post Id' })
  postId!: number;
}
