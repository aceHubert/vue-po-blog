import { Optional } from './optional.interface';
import { LinkTarget, LinkVisible } from '@/common/helpers/enums';

export interface LinkAttributes {
  id: number;
  url: string;
  name: string;
  image: string;
  target: LinkTarget;
  description: string;
  visible: LinkVisible;
  userId: number;
  rel: string;
  rss: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface LinkCreationAttributes extends Optional<LinkAttributes, 'id' | 'visible' | 'userId' | 'rel' | 'rss'> {}

export { LinkTarget, LinkVisible };
