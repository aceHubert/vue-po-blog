import { Field, ID, ObjectType } from '@nestjs/graphql';
import { OptionAutoload } from '@/common/helpers/enums';

@ObjectType({ description: '配置项' })
export class Option {
  @Field(() => ID, { description: 'Id' })
  id!: number;

  @Field({ description: 'Name' })
  optionName!: string;

  @Field({ description: 'Value' })
  optionValue!: string;

  @Field((type) => OptionAutoload, { description: '程序启动自动加载项' })
  autoload!: OptionAutoload;
}
