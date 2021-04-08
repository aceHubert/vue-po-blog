import { Field, ArgsType, ID, Int } from '@nestjs/graphql';

/**
 * 查询协议参数
 */
@ArgsType()
export class TermArgs {
  @Field({ description: '类别' })
  taxonomy!: string;

  @Field({ nullable: true, description: '搜索关键字（根据标题模糊查询）' })
  keyword?: string;

  @Field((type) => ID, { nullable: true, description: '父Id（没有值则查询所有，0是根目录）' })
  parentId?: number;

  @Field((type) => Int, { nullable: true, description: '分组' })
  group?: number;
}
