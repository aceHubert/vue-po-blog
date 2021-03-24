import { Optional } from './optional.interface';

export interface MediaMetaAttributes {
  id: number;
  mediaId: number;
  metaKey: string;
  metaValue: string;
  description?: string;
  private: 'yes' | 'no';
}

export interface MediaMetaCreationAttributes extends Optional<MediaMetaAttributes, 'id' | 'private'> {}
