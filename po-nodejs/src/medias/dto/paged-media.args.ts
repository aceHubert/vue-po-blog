import { Field, ArgsType } from '@nestjs/graphql';
import { PagedArgs } from '@/common/models/general.model';

/**
 * 媒体查询分页参数
 */
@ArgsType()
export class PagedMediaArgs extends PagedArgs {
  @Field({ nullable: true, description: '文件后缀' })
  extention?: string;

  @Field({ nullable: true, description: '媒体类型' })
  mimeType?: string;
}
