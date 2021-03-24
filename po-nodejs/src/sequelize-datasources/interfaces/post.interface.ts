import { PostStatus, PostCommentStatus } from '@/common/helpers/enums';
import { PostAttributes, PostCreationAttributes } from '@/orm-entities/interfaces';
import { PagedArgs, Paged } from './paged.interface';
import { MetaModel, NewMetaInput } from './meta.interface';

/**
 * 文章实体
 */
export interface PostModel extends PostAttributes {}

export interface PostMetaModel extends MetaModel {
  postId: number;
}

export interface PagedPostArgs extends PagedArgs {
  keyword?: string;
  author?: number;
  status?: PostStatus;
  categoryIds?: number[];
  date?: string;
}

export interface PagedPageArgs extends PagedArgs {
  keyword?: string;
  author?: number;
  status?: PostStatus;
  date?: string;
}

export interface PagedPostModel extends Paged<PostModel> {}

export interface NewPostInput extends Omit<PostCreationAttributes, 'id' | 'commentCount' | 'createdAt' | 'updatedAt'> {
  /**
   * metaKey 不可以重复
   */
  metas?: NewMetaInput[];
}

export interface NewPageInput
  extends Omit<
    PostCreationAttributes,
    'id' | 'excerpt' | 'commentStatus' | 'commentCount' | 'createdAt' | 'updatedAt'
  > {
  /**
   * metaKey 不可以重复
   */
  metas?: NewMetaInput[];
}

export interface NewPostMetaInput extends NewMetaInput {
  postId: number;
}

export interface UpdatePostInput {
  title?: string;
  content?: string;
  excerpt?: string;
  status?: PostStatus;
  commentStatus?: PostCommentStatus;
}

export interface UpdatePageInput {
  title?: string;
  content?: string;
  status?: PostStatus;
}
