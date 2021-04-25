import { Field, ArgsType } from '@nestjs/graphql';
import { OptionAutoload } from '../enums';

/**
 * 配置查询参数
 */
@ArgsType()
export class OptionArgs {
  @Field((type) => OptionAutoload, { nullable: true, description: 'Autoload at the front-end apps' })
  autoload?: OptionAutoload;
}
