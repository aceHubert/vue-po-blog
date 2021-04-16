import { PagedResponse } from './paged';
import { Post, PostCreationModel, PostPagedQuery } from './post';
import { PostStatus } from 'src/includes/datas/enums';

export type Page = Omit<Post, 'excerpt' | 'categories' | 'tags'>;

export type PageWithoutContent = Omit<Page, 'content'>;

export type PageCreationModel = Omit<PostCreationModel, 'excerpt' | 'commentStatus'>;

export type PageUpdateModel = Partial<
  PageCreationModel & {
    author: string;
    status: PostStatus;
  }
>;

export type PagePagedQuery = Omit<PostPagedQuery, 'categoryId'>;

export type PagePagedResponse = PagedResponse<PageWithoutContent>;
