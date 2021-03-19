import { Optional } from './optional.interface';

export interface MediaMetaAttributes {
  id: number;
  mediaId: number;
  metaKey: string;
  metaValue: string;
  private: 'yes' | 'no';
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MediaMetaCreationAttributes extends Optional<MediaMetaAttributes, 'id' | 'private'> {}
