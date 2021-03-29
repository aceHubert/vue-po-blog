import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { BaseResolver } from '@/common/resolvers/base.resolver';
import { Fields, ResolveTree } from '@/common/decorators/field.decorator';
import { OptionDataSource } from '@/sequelize-datasources/datasources';

// Types
import { OptionArgs } from './dto/option.args';
import { NewOptionInput } from './dto/new-option.input';
import { UpdateOptionInput } from './dto/update-option.input';
import { Option } from './models/option.model';

@Resolver()
export class OptionResolver extends BaseResolver {
  constructor(private readonly optionDataSource: OptionDataSource) {
    super();
  }

  @Query((returns) => Option, { nullable: true, description: '获取配置项' })
  option(@Args('id', { type: () => ID }) id: number, @Fields() fields: ResolveTree): Promise<Option | null> {
    return this.optionDataSource.get(id, this.getFieldNames(fields.fieldsByTypeName.Option));
  }

  @Query((returns) => String, { nullable: true, description: '获取配置项的 Value 值' })
  optionValue(@Args('name') name: string): Promise<string | null> {
    return this.optionDataSource.getOptionValue(name);
  }

  @Query((returns) => [Option], { description: '获取配置项' })
  options(@Args() args: OptionArgs, @Fields() fields: ResolveTree): Promise<Option[]> {
    return this.optionDataSource.getList(args, this.getFieldNames(fields.fieldsByTypeName.Option));
  }

  @Mutation((returns) => Option, { description: '添加配置项' })
  addOption(@Args('model', { type: () => NewOptionInput }) model: NewOptionInput): Promise<Option> {
    return this.optionDataSource.create(model);
  }

  @Mutation((returns) => Boolean, { description: '修改配置项' })
  modifyOption(
    @Args('id', { type: () => ID }) id: number,
    @Args('model', { type: () => UpdateOptionInput })
    model: UpdateOptionInput,
  ): Promise<boolean> {
    return this.optionDataSource.update(id, model);
  }

  @Mutation((returns) => Boolean, { description: '删除配置项' })
  removeOption(@Args('id', { type: () => ID }) id: number): Promise<boolean> {
    return this.optionDataSource.delete(id);
  }
}
