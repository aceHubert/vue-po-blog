import { Optional } from './optional.interface';

export interface PostMetaAttributes {
  id: number;
  postId: number;
  metaKey: string;
  metaValue: string;
  private: 'yes' | 'no';
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PostMetaCreationAttributes extends Optional<PostMetaAttributes, 'id' | 'private'> {}
