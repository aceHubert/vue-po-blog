import { Resolver, Query, Mutation, Arg, Args, Ctx } from 'type-graphql';

// Types
import { Fields, ResolveTree } from '@/utils/fieldsDecorators';
import { DataSources } from '@/dataSources';
import Option, { OptionQueryArgs, OptionAddModel } from '@/model/option';

@Resolver()
export default class OptionResolver {
  @Query((returns) => Option, { nullable: true, description: '获取配置项' })
  option(
    @Arg('id', (type) => Number!) id: number,
    @Fields() fields: ResolveTree,
    @Ctx('dataSources') { option }: DataSources,
  ) {
    return option.get(id, Object.keys(fields.fieldsByTypeName.Option));
  }

  @Query((returns) => String, { nullable: true, description: '获取配置项的 Value 值' })
  optionValue(@Arg('name', (type) => String!) name: string, @Ctx('dataSources') { option }: DataSources) {
    return option.getValue(name);
  }

  @Query((returns) => [Option], { description: '获取配置项' })
  options(@Args() args: OptionQueryArgs, @Fields() fields: ResolveTree, @Ctx('dataSources') { option }: DataSources) {
    return option.getList(args, Object.keys(fields.fieldsByTypeName.Option));
  }

  @Mutation((returns) => Option)
  addOption(
    @Arg('model', (type) => OptionAddModel) model: OptionAddModel,
    @Ctx('dataSources') { option }: DataSources,
  ) {
    return option.create(model);
  }
}
