import { Field, InputType, ID } from '@nestjs/graphql';
import { NewMetaInput } from '@/common/resolvers/dto/new-meta.input';

@InputType({ description: 'New media meta input' })
export class NewMediaMetaInput extends NewMetaInput {
  @Field(() => ID, { description: 'Media id' })
  mediaId!: number;
}
