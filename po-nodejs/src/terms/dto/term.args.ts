import { Field, ArgsType, ID, Int } from '@nestjs/graphql';

/**
 * 查询协议参数
 */
@ArgsType()
export class TermArgs {
  @Field({ description: '类别' })
  taxonomy!: string;

  @Field((type) => ID, { nullable: true, defaultValue: 0, description: '父 Id' })
  parentId!: number;

  @Field((type) => Int, { nullable: true, description: '分组' })
  group?: number;
}
