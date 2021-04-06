import { ObjectType, InputType, Field, ID } from '@nestjs/graphql';

/**
 * 元数据实体模型
 */
@ObjectType({ isAbstract: true, description: '元数据实体模型' })
export abstract class Meta {
  @Field((type) => ID, { description: 'Id' })
  id!: number;

  @Field({ description: '元数据 Key' })
  metaKey!: string;

  @Field((type) => String, { nullable: true, description: '元数据 Value' })
  metaValue!: string | null;
}

/**
 * 元数据新建模型
 */
@InputType({ description: '元数据新建实体模型' })
export class NewMetaInput {
  @Field({ description: '元数据 Key' })
  metaKey!: string;

  @Field((type) => String, { nullable: true, description: '元数据 Value' })
  metaValue!: string | null;
}
