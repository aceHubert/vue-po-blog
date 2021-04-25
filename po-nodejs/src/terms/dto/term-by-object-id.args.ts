import { Field, ArgsType, ID, Int } from '@nestjs/graphql';

/**
 * 查询协议关系参数
 */
@ArgsType()
export class TermByObjectIdArgs {
  @Field((type) => ID, { description: 'Post/Link等对象 ID' })
  objectId!: number;

  @Field({ description: '类别' })
  taxonomy!: string;

  @Field((type) => ID, { nullable: true, description: '父Id（没有值则查询所有，0是根目录）' })
  parentId?: number;

  @Field((type) => Int, { nullable: true, description: '分组' })
  group?: number;

  @Field((type) => Boolean, { nullable: true, description: '排序（默认正序排列）' })
  desc?: boolean;
}
