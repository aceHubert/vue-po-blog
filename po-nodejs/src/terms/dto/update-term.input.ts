import { InputType, PartialType, PickType } from '@nestjs/graphql';
import { NewTermInput } from './new-term.input';

@InputType({ description: '协议修改模型' })
export class UpdateTermInput extends PartialType(
  PickType(NewTermInput, ['name', 'slug', 'description', 'group'] as const),
) {}
