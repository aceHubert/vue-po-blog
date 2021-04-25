import { Field, InputType } from '@nestjs/graphql';
import { OptionAutoload } from '@/common/helpers/enums';

@InputType({ description: '配置修改模型' })
export class UpdateOptionInput {
  @Field({ nullable: true, description: 'Value' })
  optionValue?: string;

  @Field((type) => OptionAutoload, { nullable: true, description: '程序启动自动加载项' })
  autoload?: OptionAutoload;
}
