import { Field, InputType } from '@nestjs/graphql';
import { OptionAutoload } from '../enums';

@InputType({ description: '配置新建模型' })
export class NewOptionInput {
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
