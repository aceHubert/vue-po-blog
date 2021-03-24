import { Field, InputType, ID } from '@nestjs/graphql';
import { LinkTarget, LinkVisible } from '@/common/helpers/enums';

@InputType({ description: '链接修改模型' })
export class UpdateLinkInput {
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
