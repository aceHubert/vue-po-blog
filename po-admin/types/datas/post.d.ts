import { PagedQuery, PagedResponse } from './paged';
import { PostStatus, PostCommentStatus } from 'src/includes/datas/enums';

export type Post = {
  id: string;
  title: string;
  author: { id: string; displayName: string };
  excerpt: string;
  content: string;
  status: PostStatus;
  commentStatus: PostCommentStatus;
  commentCount: number;
  categories: Array<{ id: string; name: string }>;
  tags: Array<{ id: string; name: string }>;
  createTime: Date;
};

export type PostWithoutContent = Omit<Post, 'content'>;

export type PostCreationModel = {
  title: string;
  excerpt?: string;
  content: string;
  commentStatus?: PostCommentStatus;
};

export type PostUpdateModel = Partial<
  PostCreationModel & {
    author: string;
    status: PostStatus;
  }
>;

export type PostPagedQuery = PagedQuery<{
  keyword?: string;
  author?: number;
  status?: PostStatus;
  categoryId?: string;
  categoryName?: string;
  tagId?: string;
  tagName?: string;
  date?: string; // yyyyMM
}>;

export type PostPagedResponse = PagedResponse<PostWithoutContent>;

export type PostArchive = {
  date: Date;
  posts: Array<PostWithoutContent>;
  total: number;
};
