import { InputType, PartialType, PickType } from '@nestjs/graphql';
import { NewLinkInput } from './new-link.input';

@InputType({ description: 'Update link input' })
export class UpdateLinkInput extends PartialType(
  PickType(NewLinkInput, ['url', 'name', 'image', 'target', 'description', 'visible', 'rel', 'rss'] as const),
) {}
