import { Field, ObjectType, ID } from '@nestjs/graphql';
import { LinkTarget, LinkVisible } from '@/common/helpers/enums';
import { PagedResponse } from '@/common/models/general.model';

@ObjectType({ description: '链接模型' })
export class Link {
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

@ObjectType({ description: '链接分页模型' })
export class PagedLink extends PagedResponse(Link) {
  // other fields
}
