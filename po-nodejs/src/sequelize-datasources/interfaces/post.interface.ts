import { PostStatus } from '@/common/helpers/enums';
import { PostAttributes, PostCreationAttributes } from '@/orm-entities/interfaces';
import { PagedArgs, Paged } from './paged.interface';
import { MetaModel, NewMetaInput } from './meta.interface';

/**
 * 文章实体
 */
export interface PostModel extends Omit<PostAttributes, 'status'> {
  status: PostStatus;
}

export interface PostMetaModel extends MetaModel {
  postId: number;
}

/**
 * category 和 tag 不可以同时出现（Id 和 name 也不可以同时出现）
 * 优先级是 categoryId > tagId > categoryName >tagName
 */
export interface PagedPostArgs extends PagedArgs {
  keyword?: string;
  author?: number;
  /**
   * 匿名用户无效
   * 注意：查询所有状态时是不包含 Trash 状态
   */
  status?: PostStatus;
  /**
   * category (termId)
   */
  categoryId?: number;
  categoryName?: string;
  /**
   * tag (termId)
   */
  tagId?: number;
  tagName?: string;
  /**
   * 年(YYYY)/月(YYYYMM)
   */
  date?: string;
}

export interface PagedPageArgs extends Omit<PagedPostArgs, 'categoryIds'> {}

export interface PagedPostModel extends Paged<PostModel> {}

export interface NewPostInput
  extends Omit<PostCreationAttributes, 'id' | 'author' | 'commentStatus' | 'commentCount' | 'createdAt' | 'updatedAt'> {
  /**
   * metaKey 不可以重复
   */
  metas?: NewMetaInput[];
}

export interface NewPageInput
  extends Omit<
    PostCreationAttributes,
    'id' | 'author' | 'excerpt' | 'commentStatus' | 'commentCount' | 'createdAt' | 'updatedAt'
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
}

export interface UpdatePageInput {
  title?: string;
  content?: string;
  status?: PostStatus;
}
