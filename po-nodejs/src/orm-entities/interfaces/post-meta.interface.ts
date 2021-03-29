import { Optional } from './optional.interface';

export interface PostMetaAttributes {
  id: number;
  postId: number;
  metaKey: string;
  metaValue: string | null;
  private: 'yes' | 'no';
}

export interface PostMetaCreationAttributes extends Optional<PostMetaAttributes, 'id' | 'private'> {}
