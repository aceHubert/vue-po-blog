import { Field, InputType, ID } from '@nestjs/graphql';
import { NewMetaInput } from '@/common/models/meta.model';

@InputType({ description: 'New comment input' })
export class NewCommentInput {
  @Field(() => ID, { description: 'Post id' })
  postId!: number;

  @Field({ description: 'Author name' })
  author!: string;

  @Field({ nullable: true, description: "Author's email" })
  authorEmail?: string;

  @Field({ nullable: true, description: "Author's client URL address" })
  authorUrl?: string;

  @Field({ nullable: true, description: "Author's client IP address" })
  authorIp?: string;

  @Field({ description: 'content' })
  content!: string;

  @Field({ nullable: true, description: 'Client UserAgent' })
  agent?: string;

  @Field((type) => ID, { nullable: true, description: 'Parent id' })
  parentId?: number;

  @Field((type) => [NewMetaInput!], { nullable: true, description: 'Comment metas' })
  metas?: NewMetaInput[];
}
