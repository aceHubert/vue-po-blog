import { Field, InputType, ID } from '@nestjs/graphql';
import { NewMetaInput } from '@/common/models/meta.model';

// Types
import { TermMetaCreationAttributes } from '@/orm-entities/interfaces/term-meta.interface';

@InputType({ description: 'New user term input' })
export class NewTermMetaInput extends NewMetaInput implements TermMetaCreationAttributes {
  @Field(() => ID, { description: 'Term id' })
  termId!: number;
}
