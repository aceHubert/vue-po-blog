import { Field, ObjectType, ID, Int, OmitType } from '@nestjs/graphql';
import { Meta } from '@/common/models/meta.model';

@ObjectType({ description: '协议模型' })
export class TermTaxonomy {
  @Field(() => ID, { description: 'Taxonomy Id' })
  taxonomyId!: number;

  @Field({ description: '类别' })
  taxonomy!: string;

  @Field({ description: '类别说明' })
  description!: string;

  @Field((type) => Int, { description: '关联对象类别数量' })
  count!: number;

  @Field(() => ID, { description: 'Term Id' })
  id!: number;

  @Field({ description: 'Name' })
  name!: string;

  @Field({ description: '别名' })
  slug!: string;

  @Field((type) => Int, { description: '分组' })
  group!: number;
}

@ObjectType({ description: '协议关系模型(包含TermTaxonomy)' })
export class TermTaxonomyRelationship extends OmitType(TermTaxonomy, ['id'] as const) {
  @Field(() => ID, { description: 'Term Id' })
  termId!: number;

  @Field(() => ID, { description: 'Post/Link等对象 Id' })
  objectId!: number;

  @Field((type) => Int, { description: '排序' })
  order!: number;
}

@ObjectType({ description: '协议关系模型' })
export class TermRelationship {
  @Field(() => ID, { description: 'Post/Link等对象 Id' })
  objectId!: number;

  @Field(() => ID, { description: 'Taxonomy Id' })
  taxonomyId!: number;

  @Field((type) => Int, { description: '排序' })
  order!: number;
}

@ObjectType({ description: '协议元数据模型' })
export class TermMeta extends Meta {
  @Field((type) => ID, { description: 'Term Id' })
  termId!: number;
}
