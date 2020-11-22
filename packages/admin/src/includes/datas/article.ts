import { http } from '../functions';

// Types
import { Article, ArticleWithoutContent, ArticleApi } from 'types/datas/article';

/**
 * 格式化文章
 * @param article 原型
 * @param includeContent 是否包含 content
 */
function formatArticle(article: any): ArticleWithoutContent;
function formatArticle(article: any, includeContent: true): Article;
function formatArticle(article: any, includeContent = false) {
  const {
    id,
    status,
    author,
    title,
    summary,
    thumbnail,
    categoryId,
    categoryName,
    // comments,
    syncStatus,
    tagsList,
    views,
    weight,
    createTime,
  } = article;
  return Object.assign(
    {
      id,
      status,
      author,
      title,
      summary,
      thumbnail,
      category: { id: categoryId, name: categoryName },
      tags: tagsList,
      // comments,
      syncStatus,
      views,
      weight,
      createTime,
    },
    includeContent ? { content: article.content } : null,
  );
}

export const articleApi: ArticleApi = {
  /**
   * 获取文章列表
   * @param param
   */
  getList({ page = 1, size = 10, ...rest } = {}) {
    return http.getList('/v1/admin/posts', { params: { page, size, ...rest } }).then(({ models, pageInfo }) => {
      return {
        rows: models.map((article) => formatArticle(article)),
        pager: pageInfo!,
      };
    });
  },

  /**
   * 获取文章详情
   * @param id
   */
  get(id) {
    return http.get(`/v1/admin/posts/${id}`).then(({ model }) => formatArticle(model, true));
  },

  /**
   * 新建文章
   * @param article
   */
  create(data) {
    return http.post('/v1/admin/posts', data).then(({ model }) => formatArticle(model, true));
  },

  // crawler(article: any) {
  //   return http.post('/posts/posts/v1/crawler', article, {
  //     timeout: 500000,
  //   });
  // },

  /**
   * 修改文章
   * @param data
   */
  update(data) {
    return http.put('/v1/admin/posts', data).then(() => true);
  },

  /**
   *
   * @param data
   */
  updateStatus(id, status) {
    return http.put('/v1/admin/posts/status', { id, status }).then(() => true);
  },

  /**
   * 删除文章
   * @param id
   */
  delete(id) {
    return http.delete(`/v1/admin/posts/${id}`).then(() => true);
  },

  // publishByteBlogs(data: any) {
  //   return http({
  //     url: '/posts/byte-blogs/v1/publish',
  //     method: 'post',
  //     data,
  //   });
  // },
  // importDataByDB(data: any) {
  //   return http({
  //     url: '/blog-move/v1/mysql',
  //     method: 'post',
  //     timeout: 5000000,
  //     data,
  //   });
  // },
};
