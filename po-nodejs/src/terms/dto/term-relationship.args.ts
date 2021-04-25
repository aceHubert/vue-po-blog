import { Field, ArgsType, ID } from '@nestjs/graphql';

/**
 * 查询协议关系参数
 */
@ArgsType()
export class TermRelationshipArgs {
  @Field((type) => ID, { description: 'Post/Link等对象 ID' })
  objectId!: number;

  @Field({ description: '类别' })
  taxonomy!: string;
}
