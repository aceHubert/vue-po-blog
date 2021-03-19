import { ObjectType, InputType, Field, ID } from '@nestjs/graphql';
/**
 * 元数据实体模型
 */
@ObjectType({ description: '元数据实体模型' })
export abstract class Meta {
  @Field((type) => ID, { description: 'Id' })
  id!: number;

  @Field({ description: '元数据 Key' })
  metaKey!: string;

  @Field({ description: '元数据 Value' })
  metaValue!: string;
}

@InputType({ description: '元数据新建实体模型' })
export abstract class NewMetaInput {
  @Field({ description: '元数据 Key' })
  metaKey!: string;

  @Field({ description: '元数据 Value' })
  metaValue!: string;
}
