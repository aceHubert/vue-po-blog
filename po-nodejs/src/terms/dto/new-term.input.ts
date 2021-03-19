import { Field, InputType, ID, Int } from '@nestjs/graphql';
import { NewMetaInput } from '@/common/models/meta.model';

@InputType({ description: '协议新建模型' })
export class NewTermInput {
  @Field({ description: 'Name' })
  name!: string;

  @Field({ description: '类别' })
  taxonomy!: string;

  @Field({ nullable: true, description: '别名' })
  slug?: string;

  @Field((type) => Int, { nullable: true, description: '分组' })
  group?: number;

  @Field((type) => ID, { nullable: true, description: '如果提供，则自动绑定关系' })
  objectId?: number;

  @Field((type) => [NewMetaInput!], { nullable: true, description: '协议元数据' })
  public metas?: NewMetaInput[];
}
