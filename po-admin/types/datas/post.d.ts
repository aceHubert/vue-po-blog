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
  keywords?: string;
  author?: number;
  status?: PostStatus;
  categoryIds?: string[];
  date?: string; // yyyyMM
}>;

export type PostPagedResponse = PagedResponse<PostWithoutContent>;

export type PostArchive = {
  date: Date;
  posts: Array<PostWithoutContent>;
  total: number;
};
