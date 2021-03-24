import { Field, InputType, ID } from '@nestjs/graphql';
import { NewMetaInput } from '@/common/models/meta.model';

@InputType({ description: '媒体元数据新建模型' })
export class NewMediaMetaInput extends NewMetaInput {
  @Field(() => ID, { description: 'Media Id' })
  mediaId!: number;
}
