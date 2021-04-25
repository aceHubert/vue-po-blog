import { Field, InputType } from '@nestjs/graphql';
import { NewMetaInput } from '@/common/models/meta.model';

@InputType({ description: 'New page input' })
export class NewPageInput {
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

  @Field((type) => [NewMetaInput!], { nullable: true, description: 'Page metas' })
  metas?: NewMetaInput[];
}
