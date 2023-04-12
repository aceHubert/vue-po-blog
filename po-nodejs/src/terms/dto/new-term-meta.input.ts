import { Field, InputType, ID } from '@nestjs/graphql';
import { NewMetaInput } from '@/common/resolvers/dto/new-meta.input';

// Types
import { TermMetaCreationAttributes } from '@/orm-entities/interfaces';

@InputType({ description: 'New term meta input' })
export class NewTermMetaInput extends NewMetaInput implements TermMetaCreationAttributes {
  @Field(() => ID, { description: 'Term id' })
  termId!: number;
}
