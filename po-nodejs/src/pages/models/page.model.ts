import { Field, ObjectType, ID } from '@nestjs/graphql';
import { PostStatus } from '@/common/helpers/enums';
import { PagedResponse } from '@/common/models/general.model';
import { Meta } from '@/common/models/meta.model';

@ObjectType({ description: '页面模型' })
export class Page {
  @Field((type) => ID, { description: 'Id' })
  id!: number;

  @Field({ description: '标题' })
  public title!: string;

  @Field({ description: '内容' })
  public content!: string;

  @Field((type) => PostStatus, { description: '状态' })
  public status!: PostStatus;
}

@ObjectType({ description: '页面分页模型' })
export class PagedPage extends PagedResponse(Page) {
  // other fields
}

@ObjectType({ description: '页面元数据模型' })
export class PageMeta extends Meta {
  @Field((type) => ID, { name: 'pageId', description: 'Page Id' })
  postId!: number;
}
