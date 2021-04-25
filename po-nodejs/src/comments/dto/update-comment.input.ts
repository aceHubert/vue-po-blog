import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Update comment input' })
export class UpdateCommentInput {
  @Field({ description: 'Content' })
  content!: string;
}
