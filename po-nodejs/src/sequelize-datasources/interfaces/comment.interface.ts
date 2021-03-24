import { CommentAttributes, CommentCreationAttributes } from '@/orm-entities/interfaces';
import { PagedArgs, Paged } from './paged.interface';
import { MetaModel, NewMetaInput } from './meta.interface';

export interface CommentModel extends CommentAttributes {}

export interface CommentMetaModel extends MetaModel {
  commentId: number;
}

export interface PagedCommentArgs extends PagedArgs {
  postId?: number;
  parentId?: number;
}

export interface PagedCommentModel extends Paged<CommentModel> {}

export interface NewCommentInput extends Omit<CommentCreationAttributes, 'id' | 'updatedAt' | 'createdAt'> {
  /**
   * metaKey 不可以重复
   */
  metas?: NewMetaInput[];
}

export interface NewCommentMetaInput extends NewMetaInput {
  commentId: number;
}

export class UpdateCommentInput {
  content!: string;
}
