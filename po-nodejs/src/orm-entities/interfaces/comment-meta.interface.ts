import { Optional } from './optional.interface';

export interface CommentMetaAttributes {
  id: number;
  commentId: number;
  metaKey: string;
  metaValue: string;
  private: 'yes' | 'no';
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CommentMetaCreationAttributes extends Optional<CommentMetaAttributes, 'id' | 'private'> {}
