import { http } from '../functions';

// Types
import { PostApi } from 'types/datas/post';

/**
 * 格式化 Post
 * @param post 原型
 * @param includeContent 是否包含 content
 */
function formatPost(post: any, includeContent = false) {
  const {
    id,
    status,
    author,
    title,
    summary,
    thumbnail,
    categoryId,
    categoryName,
    comments,
    syncStatus,
    tagsList,
    views,
    weight,
    createTime,
  } = post;
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
      comments,
      syncStatus,
      views,
      weight,
      createTime,
    },
    includeContent ? { content: post.content } : null,
  );
}

export const postApi: PostApi = {
  /**
   * 获取文章列表
   * @param param
   */
  getList({ page = 1, size = 10, ...rest } = {}) {
    return http
      .get('posts/posts/v1/list', { params: { page, size, ...rest } })
      .then(({ data: { models, pageInfo } = {} }) => {
        return {
          rows: models.map(formatPost),
          pager: pageInfo,
        };
      });
  },

  /**
   * 获取文章数量
   */
  getCount() {
    return http.get('posts/posts/v1/count').then(({ data: { model = 0 } }) => model);
  },

  /**
   * 获取文章归档
   */
  getArchive() {
    return http.get('posts/archive/v1/list').then(({ data: { models = [] } }) =>
      models.map((item: any) => ({
        date: item.archiveDate,
        posts: item.archivePosts.map(formatPost),
        total: item.archiveTotal,
      })),
    );
  },

  /**
   * 获取文章详情
   * @param id
   */
  get(id) {
    return http.get(`posts/posts/v1/${id}`).then(({ data: { model } }) => formatPost(model, true));
  },
};
