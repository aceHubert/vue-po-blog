import { Field, ObjectType, InputType, ArgsType, ID, Int } from 'type-graphql';
import Meta, { MetaAddModel } from './meta';

// Types
import { TermMetaCreationAttributes } from '@/dataSources/entities/termMeta';

@ObjectType({ description: '协议模型' })
export default class Term {
  @Field(() => ID, { description: 'Id' })
  id!: number;

  @Field({ description: 'Name' })
  name!: string;

  @Field({ description: '别名' })
  slug!: string;

  @Field((type) => Int, { description: '分组' })
  group!: number;

  @Field({ description: '类别' })
  taxonomy!: string;

  @Field({ description: '类别说明' })
  description!: string;

  @Field((type) => Int, { description: '关联类别数量' })
  count!: number;
}

@ObjectType({ description: '协议关系模型' })
export class TermRelationship {
  @Field(() => ID, { description: 'Post/Link Id' })
  objectId!: number;

  @Field(() => ID, { description: '分类 Id' })
  taxonomyId!: number;

  @Field((type) => Int, { description: '排序' })
  order!: number;
}

/**
 * 查询协议参数
 */
@ArgsType()
export class TermQueryArgs {
  @Field({ description: '类别' })
  taxonomy!: string;

  @Field((type) => ID, { nullable: true, defaultValue: 0, description: '父 Id' })
  parentId!: number;

  @Field((type) => Int, { nullable: true, defaultValue: 0, description: '分组' })
  group!: number;
}

@ObjectType({ description: '协议元数据模型' })
export class TermMeta extends Meta {
  @Field((type) => ID, { description: 'Term Id' })
  termId!: number;
}

@InputType({ description: '协议元数据新建模型' })
export class TermMetaAddModel extends MetaAddModel implements TermMetaCreationAttributes {
  @Field(() => ID, { description: 'Term Id' })
  termId!: number;
}

@InputType({ description: '协议关系新建模型' })
export class TermRelationshipAddModel {
  @Field((type) => ID, { description: 'Post/Link Id' })
  objectId!: number;

  @Field((type) => ID, { description: '分类 Id' })
  taxonomyId!: number;

  @Field((type) => Int, { nullable: true, description: '排序' })
  order?: number;
}

@InputType({ description: '协议新建模型' })
export class TermAddModel {
  @Field({ description: 'Name' })
  name!: string;

  @Field({ description: '类别' })
  taxonomy!: string;

  @Field({ nullable: true, description: '别名' })
  slug?: string;

  @Field((type) => Int, { nullable: true, description: '分组' })
  group?: number;

  @Field((type) => [MetaAddModel], { nullable: true, description: '协议元数据' })
  public metas?: MetaAddModel[];
}
