import { http } from '../functions';

export const articleApi = {
  fetchList(query: any) {
    return http({
      url: '/posts/posts/v1/list',
      method: 'get',
      params: query,
    });
  },
  fetchByteBlogsList(query: any) {
    return http({
      url: '/posts/byte-blogs/v1/list',
      method: 'get',
      params: query,
    });
  },
  fetchArticle(id: number) {
    return http({
      url: `/posts/posts/v1/${id}`,
      method: 'get',
    });
  },
  createArticle(data: any) {
    return http({
      url: '/posts/posts/v1/add',
      method: 'post',
      data,
    });
  },
  crawlerArticle(data: any) {
    return http({
      url: '/posts/posts/v1/crawler',
      method: 'post',
      timeout: 500000,
      data,
    });
  },
  updateArticle(data: any) {
    return http({
      url: '/posts/posts/v1/update',
      method: 'put',
      data,
    });
  },
  updateArticleStatus(data: any) {
    return http({
      url: '/posts/status/v1/update',
      method: 'put',
      data,
    });
  },
  deletePosts(id: number) {
    return http({
      url: `/posts/posts/v1/${id}`,
      method: 'delete',
    });
  },
  publishByteBlogs(data: any) {
    return http({
      url: '/posts/byte-blogs/v1/publish',
      method: 'post',
      data,
    });
  },
  importDataByDB(data: any) {
    return http({
      url: '/blog-move/v1/mysql',
      method: 'post',
      timeout: 5000000,
      data,
    });
  },
};
