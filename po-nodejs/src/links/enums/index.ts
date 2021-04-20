import { registerEnumType } from '@nestjs/graphql';
import { LinkTarget } from './link-target.enum';
import { LinkVisible } from './link-visible.enum';

registerEnumType(LinkTarget, {
  name: 'LINK_TARGET',
  description: 'link target',
});

registerEnumType(LinkVisible, {
  name: 'LINK_VISIBLE',
  description: 'link visible',
});

export { LinkTarget, LinkVisible };
