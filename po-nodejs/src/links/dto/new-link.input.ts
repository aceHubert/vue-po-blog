import { Field, InputType } from '@nestjs/graphql';
import { LinkTarget, LinkVisible } from '../enums';

@InputType({ description: 'New link input' })
export class NewLinkInput {
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

  @Field((type) => LinkVisible, { nullable: true, description: 'Visible' })
  visible?: LinkVisible;

  @Field({ nullable: true, description: 'rel' })
  rel?: string;

  @Field({ nullable: true, description: 'rss' })
  rss?: string;
}
