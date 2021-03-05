import { Field, ObjectType, ArgsType, InputType, ID } from 'type-graphql';
import { PostStatus } from '@/dataSources';
import { PagedQueryArgs, PagedResponse } from './general';
import Meta, { MetaAddModel } from './meta';

// Types
import { PostCreationAttributes } from '@/dataSources/entities/posts';
import { PostMetaCreationAttributes } from '@/dataSources/entities/postMeta';

@ObjectType({ description: '页面模型' })
export default class Page {
  @Field((type) => ID, { description: 'Id' })
  id!: number;

  @Field({ description: '标题' })
  public title!: string;

  @Field({ description: '内容' })
  public content!: string;

  @Field((type) => PostStatus, { description: '状态' })
  public status!: PostStatus;
}

/**
 * 页面分页查询参数
 */
@ArgsType()
export class PagedPageQueryArgs extends PagedQueryArgs {
  @Field({ nullable: true, description: '搜索关键字（根据标题模糊查询）' })
  keyword?: string;

  @Field({ nullable: true, description: '文章作者' })
  author?: number;

  @Field((type) => PostStatus, { nullable: true, description: '页面状态' })
  status?: PostStatus;

  @Field({ nullable: true, description: '日期，格式：yyyy-MM' })
  date?: string;
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

@InputType({ description: '页面元数据新建模型' })
export class PageMetaAddModel extends MetaAddModel implements PostMetaCreationAttributes {
  @Field(() => ID, { name: 'pageId', description: 'Page Id' })
  postId!: number;
}

@InputType({ description: '页面新建模型' })
export class PageAddModel implements PostCreationAttributes {
  @Field({ description: '标题' })
  public title!: string;

  @Field({ nullable: true, description: '唯一标识，用于 Url 显示' })
  public name?: string;

  @Field({ description: '内容' })
  public content!: string;

  @Field((type) => [MetaAddModel], { nullable: true, description: '页面元数据' })
  public metas?: MetaAddModel[];
}

@InputType({ description: '页面修改模型' })
export class PageUpdateModel {
  @Field({ description: '标题' })
  title!: string;

  @Field({ description: '内容' })
  content!: string;

  @Field((type) => PostStatus, { nullable: true, description: '状态' })
  status?: PostStatus;
}
