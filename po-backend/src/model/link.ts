import { Field, ObjectType, InputType, ArgsType, ID } from 'type-graphql';
import { LinkTarget, LinkVisible } from '@/dataSources';
import { PagedQueryArgs, PagedResponse } from './general';

// Types
import { LinkCreationAttributes } from '@/dataSources/entities/links';

@ObjectType({ description: '链接模型' })
export default class Link {
  @Field(() => ID, { description: 'Id' })
  id!: number;

  @Field({ description: 'Url' })
  url!: string;

  @Field({ description: '名称' })
  name!: string;

  @Field({ description: '图片' })
  image!: string;

  @Field((type) => LinkTarget, { description: '打开方式: "_blank","_self"' })
  target!: LinkTarget;

  @Field({ description: '描述' })
  description!: string;

  @Field((type) => LinkVisible, { description: '是否显示' })
  visible!: LinkVisible;

  @Field({ nullable: true, description: 'rel' })
  rel?: string;

  @Field({ nullable: true, description: 'rss' })
  rss?: string;
}

/**
 * 链接查询分页参数
 */
@ArgsType()
export class PagedLinkQueryArgs extends PagedQueryArgs {
  @Field({ nullable: true, description: '根据名称模糊搜索' })
  name?: string;
}

@ObjectType({ description: '链接分页模型' })
export class PagedLink extends PagedResponse(Link) {
  // other fields
}

@InputType({ description: '链接新建模型' })
export class LinkAddModel implements LinkCreationAttributes {
  @Field({ description: 'Url' })
  url!: string;

  @Field({ description: '名称' })
  name!: string;

  @Field({ description: '图片' })
  image!: string;

  @Field((type) => LinkTarget, { description: '打开方式: "_blank","_self"' })
  target!: LinkTarget;

  @Field({ description: '描述' })
  description!: string;

  @Field((type) => LinkVisible, { nullable: true, description: '是否显示' })
  visible?: LinkVisible;

  @Field(() => ID, { nullable: true, description: 'User Id' })
  userId?: number;

  @Field({ nullable: true, description: 'rel' })
  rel?: string;

  @Field({ nullable: true, description: 'rss' })
  rss?: string;
}

@InputType({ description: '链接修改模型' })
export class LinkUpdateModel {
  @Field({ nullable: true, description: 'Url' })
  url?: string;

  @Field({ nullable: true, description: '名称' })
  name?: string;

  @Field({ nullable: true, description: '图片' })
  image?: string;

  @Field((type) => LinkTarget, { nullable: true, description: '打开方式: "_blank","_self"' })
  target?: LinkTarget;

  @Field({ nullable: true, description: '描述' })
  description?: string;

  @Field((type) => LinkVisible, { nullable: true, description: '是否显示' })
  visible?: LinkVisible;

  @Field(() => ID, { nullable: true, description: 'User Id' })
  userId?: number;

  @Field({ nullable: true, description: 'rel' })
  rel?: string;

  @Field({ nullable: true, description: 'rss' })
  rss?: string;
}
