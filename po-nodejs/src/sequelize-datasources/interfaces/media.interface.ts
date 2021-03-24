import { MediaAttributes, MediaCreationAttributes } from '@/orm-entities/interfaces';
import { PagedArgs, Paged } from './paged.interface';
import { MetaModel, NewMetaInput } from './meta.interface';

export interface MediaModel extends MediaAttributes {}

export interface MediaMetaModel extends MetaModel {
  mediaId: number;
}

export interface PagedMediaArgs extends PagedArgs {
  extention?: string;
  mimeType?: string;
}

export interface PagedMediaModel extends Paged<MediaModel> {}

export interface NewMediaInput extends Omit<MediaCreationAttributes, 'id' | 'createdAt'> {
  /**
   * metaKey 不可以重复
   */
  metas?: NewMetaInput[];
}

export interface NewMediaMetaInput extends NewMetaInput {
  mediaId: number;
}
