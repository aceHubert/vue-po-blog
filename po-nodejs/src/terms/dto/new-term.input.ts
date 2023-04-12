import { Field, InputType, ID, Int } from '@nestjs/graphql';
import { NewMetaInput } from '@/common/resolvers/dto/new-meta.input';

@InputType({ description: 'New term input' })
export class NewTermInput {
  @Field({ description: 'Term name' })
  name!: string;

  @Field({ nullable: true, description: 'Term slug' })
  slug?: string;

  @Field({ description: 'Taxonomy name' })
  taxonomy!: string;

  @Field({ description: 'Taxonomy description' })
  description!: string;

  @Field((type) => ID, { nullable: true, defaultValue: 0, description: 'Parent id (taxonomyId, default: 0)' })
  parentId!: number;

  @Field((type) => Int, { nullable: true, description: 'Group' })
  group?: number;

  @Field((type) => ID, {
    nullable: true,
    description: 'Object id (it will add the relationship with currect term if provide a value)',
  })
  objectId?: number;

  @Field((type) => [NewMetaInput!], { nullable: true, description: 'New metas' })
  metas?: NewMetaInput[];
}
