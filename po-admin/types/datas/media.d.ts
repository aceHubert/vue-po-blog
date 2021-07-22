import { PagedQuery, PagedResponse } from './paged';

export type Media = {
  id: string;
  fileName: string;
  originalFileName: string;
  extension: string;
  mimeType: string;
  createTime: Date;
};

export type MediaPagedQuery = PagedQuery<{
  keyword?: string;
}>;

export type MediaPagedResponse = PagedResponse<Media>;
