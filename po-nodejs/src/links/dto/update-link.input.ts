import { InputType, PartialType, PickType } from '@nestjs/graphql';
import { NewLinkInput } from './new-link.input';

@InputType({ description: '链接修改模型' })
export class UpdateLinkInput extends PartialType(
  PickType(NewLinkInput, ['url', 'name', 'image', 'target', 'description', 'visible', 'userId', 'rel', 'rss'] as const),
) {}
