import { Field, ArgsType } from '@nestjs/graphql';
import { PagedArgs } from '@/common/models/general.model';

/**
 * 媒体查询分页参数
 */
@ArgsType()
export class PagedMediaArgs extends PagedArgs {
  @Field({ nullable: true, description: 'File extension' })
  extension?: string;

  @Field({ nullable: true, description: 'File mime type' })
  mimeType?: string;
}
