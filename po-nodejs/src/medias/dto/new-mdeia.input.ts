import { Field, InputType, ID } from '@nestjs/graphql';
import { NewMetaInput } from '@/common/models/meta.model';

@InputType({ description: '媒体新建模型' })
export class NewMediaInput {
  @Field({ description: '文件名' })
  fileName!: string;

  @Field({ description: '原始文件名' })
  originalFileName!: string;

  @Field({ description: '文件后缀' })
  extention!: string;

  @Field({ description: '媒体类型' })
  mimeType!: string;

  @Field({ description: '相对路径' })
  path!: string;

  @Field(() => ID, { nullable: true, description: 'User Id' })
  userId?: number;

  @Field((type) => [NewMetaInput], { nullable: true, description: '媒体元数据' })
  metas?: NewMetaInput[];
}
