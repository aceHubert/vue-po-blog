import { Optional } from './optional.interface';

export interface MediaMetaAttributes {
  id: number;
  mediaId: number;
  metaKey: string;
  metaValue?: string;
}

export interface MediaMetaCreationAttributes extends Optional<MediaMetaAttributes, 'id'> {}
