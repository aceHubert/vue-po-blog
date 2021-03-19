import { Field, ArgsType } from '@nestjs/graphql';
import { OptionAutoload } from '@/common/helpers/enums';

/**
 * 配置查询参数
 */
@ArgsType()
export class OptionArgs {
  @Field((type) => OptionAutoload, { nullable: true, description: '程序启动自动加载项' })
  autoload?: OptionAutoload;
}
