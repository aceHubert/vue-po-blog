import { Field, InputType } from '@nestjs/graphql';
import { NewMetaInput } from '@/common/resolvers/dto/new-meta.input';

@InputType({ description: 'New post input' })
export class NewPostInput {
  @Field({ description: 'Title' })
  title!: string;

  @Field({
    nullable: true,
    description:
      'Name (display at the URL address, it will fill by encoded title if none value is provided, must be unique)',
  })
  name?: string;

  @Field({ description: 'Content' })
  content!: string;

  @Field({ description: 'Excerpt' })
  excerpt!: string;

  @Field((type) => [NewMetaInput!], { nullable: true, description: 'Post metas' })
  metas?: NewMetaInput[];
}
