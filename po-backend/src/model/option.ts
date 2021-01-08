import { Field, ObjectType, InputType, ArgsType, ID } from 'type-graphql';
import { OptionAutoload } from './enums';

// Types
import { OptionCreationAttributes } from '@/dataSources/entities/options';

@ObjectType({ description: '配置项' })
export default class Option {
  @Field(() => ID, { description: 'Id' })
  id!: number;

  @Field({ description: 'Name' })
  optionName!: string;

  @Field({ description: 'Value' })
  optionValue!: string;

  @Field((type) => OptionAutoload, { description: '程序启动自动加载项' })
  autoload!: OptionAutoload;
}

/**
 * 配置查询参数
 */
@ArgsType()
export class OptionQueryArgs {
  @Field((type) => OptionAutoload, { nullable: true, description: '程序启动自动加载项' })
  autoload?: OptionAutoload;
}

@InputType({ description: '配置新建模型' })
export class OptionAddModel implements OptionCreationAttributes {
  @Field({ description: 'Name' })
  optionName!: string;

  @Field({ description: 'Value' })
  optionValue!: string;

  @Field((type) => OptionAutoload, {
    nullable: true,
    defaultValue: OptionAutoload.No,
    description: '程序启动自动加载项',
  })
  autoload?: OptionAutoload;
}

@InputType({ description: '配置修改模型' })
export class OptionUpdateModel {
  @Field({ nullable: true, description: 'Value' })
  optionValue?: string;

  @Field((type) => OptionAutoload, { nullable: true, description: '程序启动自动加载项' })
  autoload?: OptionAutoload;
}
