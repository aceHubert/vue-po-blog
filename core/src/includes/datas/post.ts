import { http } from '../functions/http';

// Types
import { PostsQuery, Post, PostsResponse } from 'types/datas/post';

function formatPost(post: any) {
  const {
    id,
    status,
    author,
    title,
    summary,
    content,
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
  return {
    id,
    status,
    author,
    title,
    summary,
    content,
    thumbnail,
    category: { id: categoryId, name: categoryName },
    tags: tagsList,
    comments,
    syncStatus,
    views,
    weight,
    createTime,
  };
}

export const post = {
  /**
   * 获取文章列表
   * @param param
   */
  getList({ page = 1, size = 10, ...rest }: PostsQuery = {}): Promise<PostsResponse> {
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
   * 获取文章详情
   * @param id
   */
  get(id: number): Promise<Post> {
    return http.get(`posts/posts/v1/${id}`).then(({ data: { models } }) => {
      return formatPost(models);
    });
  },
};
