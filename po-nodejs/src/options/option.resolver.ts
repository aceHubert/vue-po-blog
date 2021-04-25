import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { BaseResolver } from '@/common/resolvers/base.resolver';
import { Fields, ResolveTree } from '@/common/decorators/field.decorator';
import { Authorized } from '@/common/decorators/authorized.decorator';
import { User } from '@/common/decorators/user.decorator';
import { OptionDataSource } from '@/sequelize-datasources/datasources';

// Types
import { OptionArgs } from './dto/option.args';
import { NewOptionInput } from './dto/new-option.input';
import { UpdateOptionInput } from './dto/update-option.input';
import { Option } from './models/option.model';

@Resolver(() => Option)
export class OptionResolver extends BaseResolver {
  constructor(private readonly optionDataSource: OptionDataSource) {
    super();
  }

  @Query((returns) => Option, { nullable: true, description: 'Get option.' })
  option(@Args('id', { type: () => ID }) id: number, @Fields() fields: ResolveTree): Promise<Option | null> {
    return this.optionDataSource.get(id, this.getFieldNames(fields.fieldsByTypeName.Option));
  }

  @Query((returns) => String, { nullable: true, description: 'Get option value by name.' })
  optionValue(@Args('name') name: string): Promise<string | null> {
    return this.optionDataSource.getOptionValue(name);
  }

  @Query((returns) => [Option], { description: 'Get options.' })
  options(@Args() args: OptionArgs, @Fields() fields: ResolveTree): Promise<Option[]> {
    return this.optionDataSource.getList(args, this.getFieldNames(fields.fieldsByTypeName.Option));
  }

  @Authorized()
  @Mutation((returns) => Option, { description: 'Create a new option.' })
  createOption(
    @Args('model', { type: () => NewOptionInput }) model: NewOptionInput,
    @User() requestUser: JwtPayloadWithLang,
  ): Promise<Option> {
    return this.optionDataSource.create(model, requestUser);
  }

  @Authorized()
  @Mutation((returns) => Boolean, { description: 'Update option.' })
  updateOption(
    @Args('id', { type: () => ID, description: 'Option id' }) id: number,
    @Args('model') model: UpdateOptionInput,
    @User() requestUser: JwtPayloadWithLang,
  ): Promise<boolean> {
    return this.optionDataSource.update(id, model, requestUser);
  }

  @Authorized()
  @Mutation((returns) => Boolean, { description: 'Delete option permanently.' })
  deleteOption(
    @Args('id', { type: () => ID, description: 'Option id' }) id: number,
    @User() requestUser: JwtPayloadWithLang,
  ): Promise<boolean> {
    return this.optionDataSource.delete(id, requestUser);
  }
}
