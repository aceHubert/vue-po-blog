import { Field, InputType, ID } from '@nestjs/graphql';
import { NewMetaInput } from '@/common/models/meta.model';

// Types
import { PostMetaCreationAttributes } from '@/orm-entities/interfaces/post-meta.interface';

@InputType({ description: '文章元数据新建模型' })
export class NewPostMetaInput extends NewMetaInput implements PostMetaCreationAttributes {
  @Field(() => ID, { description: 'Post Id' })
  postId!: number;
}
