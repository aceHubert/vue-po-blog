import { Field, InputType } from '@nestjs/graphql';
import { NewMetaInput } from '@/common/models/meta.model';

@InputType({ description: '页面新建模型' })
export class NewPageInput {
  @Field({ description: '标题' })
  title!: string;

  @Field({ nullable: true, description: '唯一标识，用于 Url 显示' })
  name?: string;

  @Field({ description: '内容' })
  content!: string;

  @Field((type) => [NewMetaInput!], { nullable: true, description: '页面元数据' })
  metas?: NewMetaInput[];
}
