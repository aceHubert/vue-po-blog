import { Field, InputType, ID } from '@nestjs/graphql';
import { NewMetaInput } from '@/common/models/meta.model';

// Types
import { PostMetaCreationAttributes } from '@/orm-entities/interfaces/post-meta.interface';

@InputType({ description: '页面元数据新建模型' })
export class NewPageMetaInput extends NewMetaInput implements PostMetaCreationAttributes {
  @Field(() => ID, { name: 'pageId', description: 'Page Id' })
  postId!: number; // todo: change to be pageId
}
