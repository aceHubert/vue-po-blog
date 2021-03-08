import { Resolver, Query, Mutation, Arg, Args, ID, Ctx } from 'type-graphql';
import BaseResolver from './base';

// Types
import { Fields, ResolveTree } from '@/utils/fieldsDecorators';
import { DataSources } from '@/dataSources';
import Option, { OptionQueryArgs, OptionAddModel, OptionUpdateModel } from '@/model/option';

@Resolver()
export default class OptionResolver extends BaseResolver {
  @Query((returns) => Option, { nullable: true, description: '获取配置项' })
  option(
    @Arg('id', (type) => Number!) id: number,
    @Fields() fields: ResolveTree,
    @Ctx('dataSources') { option }: DataSources,
  ) {
    return option.get(id, this.getFieldNames(fields.fieldsByTypeName.Option));
  }

  @Query((returns) => String, { nullable: true, description: '获取配置项的 Value 值' })
  optionValue(@Arg('name', (type) => String!) name: string, @Ctx('dataSources') { option }: DataSources) {
    return option.getValue(name);
  }

  @Query((returns) => [Option], { description: '获取配置项' })
  options(@Args() args: OptionQueryArgs, @Fields() fields: ResolveTree, @Ctx('dataSources') { option }: DataSources) {
    return option.getList(args, this.getFieldNames(fields.fieldsByTypeName.Option));
  }

  @Mutation((returns) => Option, { description: '添加配置项' })
  addOption(
    @Arg('model', (type) => OptionAddModel) model: OptionAddModel,
    @Ctx('dataSources') { option }: DataSources,
  ) {
    return option.create(model);
  }

  @Mutation((returns) => Boolean, { description: '修改配置项' })
  updateOptions(
    @Arg('id', (type) => ID) id: number,
    @Arg('model', (type) => OptionUpdateModel)
    model: OptionUpdateModel,
    @Ctx('dataSources') { option }: DataSources,
  ) {
    return option.update(id, model);
  }
}
