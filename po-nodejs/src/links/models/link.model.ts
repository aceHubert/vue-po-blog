import { Field, ObjectType, ID } from '@nestjs/graphql';
import { PagedResponse } from '@/common/models/general.model';
import { LinkTarget, LinkVisible } from '../enums';

@ObjectType({ description: 'Link model' })
export class Link {
  @Field(() => ID, { description: 'Link id' })
  id!: number;

  @Field({ description: 'URL address' })
  url!: string;

  @Field({ description: 'Name' })
  name!: string;

  @Field({ description: 'Image' })
  image!: string;

  @Field((type) => LinkTarget, { description: 'Open window method' })
  target!: LinkTarget;

  @Field({ description: 'Description' })
  description!: string;

  @Field((type) => LinkVisible, { description: 'Visible' })
  visible!: LinkVisible;

  @Field({ nullable: true, description: 'rel' })
  rel?: string;

  @Field({ nullable: true, description: 'rss' })
  rss?: string;
}

@ObjectType({ description: 'Link paged model' })
export class PagedLink extends PagedResponse(Link) {
  // other fields
}
