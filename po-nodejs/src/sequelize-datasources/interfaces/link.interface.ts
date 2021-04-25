import { LinkAttributes, LinkCreationAttributes } from '@/orm-entities/interfaces';
import { LinkTarget, LinkVisible } from '@/links/enums';
import { PagedArgs, Paged } from './paged.interface';

export interface LinkModel extends LinkAttributes {}

export interface PagedLinkArgs extends PagedArgs {
  name?: string;
}

export interface PagedLinkModel extends Paged<LinkModel> {}

export interface NewLinkInput extends Omit<LinkCreationAttributes, 'id' | 'updatedAt' | 'createdAt'> {}

export class UpdateLinkInput {
  url?: string;
  name?: string;
  image?: string;
  target?: LinkTarget;
  description?: string;
  visible?: LinkVisible;
  userId?: number;
  rel?: string;
  rss?: string;
}
