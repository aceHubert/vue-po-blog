import { Field, ArgsType, ID, Int } from '@nestjs/graphql';

/**
 * 查询协议参数
 */
@ArgsType()
export class TermArgs {
  @Field({ description: 'Taxonomy name' })
  taxonomy!: string;

  @Field({ nullable: true, description: 'Search keywork (fuzzy searching from term name)' })
  keyword?: string;

  @Field((type) => ID, {
    nullable: true,
    description: 'Parent id (it will search for all if none value is provided, 0 is root parent id)',
  })
  parentId?: number;

  @Field((type) => Int, { nullable: true, description: 'Group(it will search for all if none value is provided)' })
  group?: number;
}
