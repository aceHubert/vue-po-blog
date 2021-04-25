import { InputType, PartialType, PickType } from '@nestjs/graphql';
import { NewTermInput } from './new-term.input';

@InputType({ description: 'Update term input' })
export class UpdateTermInput extends PartialType(
  PickType(NewTermInput, ['name', 'slug', 'description', 'group', 'parentId'] as const),
) {}
