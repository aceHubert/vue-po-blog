import { Field, InputType, ID, Int } from '@nestjs/graphql';

@InputType({ description: '协议关系新建模型' })
export class NewTermRelationshipInput {
  @Field((type) => ID, { description: 'Post/Link等对象 Id' })
  objectId!: number;

  @Field((type) => ID, { description: '分类 Id' })
  taxonomyId!: number;

  @Field((type) => Int, { nullable: true, description: '排序' })
  order?: number;
}
