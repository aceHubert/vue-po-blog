import { Optional } from './optional.interface';

export interface CommentMetaAttributes {
  id: number;
  commentId: number;
  metaKey: string;
  metaValue?: string;
}

export interface CommentMetaCreationAttributes extends Optional<CommentMetaAttributes, 'id'> {}
