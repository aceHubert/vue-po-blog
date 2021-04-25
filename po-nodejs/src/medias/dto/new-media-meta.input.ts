import { Field, InputType, ID } from '@nestjs/graphql';
import { NewMetaInput } from '@/common/models/meta.model';

@InputType({ description: 'New media meta input' })
export class NewMediaMetaInput extends NewMetaInput {
  @Field(() => ID, { description: 'Media id' })
  mediaId!: number;
}
