import { ObjectType, InputType, Field, ID } from '@nestjs/graphql';

/**
 * 元数据实体模型
 */
@ObjectType({ isAbstract: true, description: 'Meta model' })
export abstract class Meta {
  @Field((type) => ID, { description: 'Meta id' })
  id!: number;

  @Field({ description: 'Meta key' })
  metaKey!: string;

  @Field((type) => String, { nullable: true, description: 'Meta value' })
  metaValue?: string;
}

/**
 * 元数据新建模型
 */
@InputType({ description: 'New meta input' })
export class NewMetaInput {
  @Field({ description: 'Meta key' })
  metaKey!: string;

  @Field((type) => String, { nullable: true, description: 'Meta value' })
  metaValue?: string;
}
