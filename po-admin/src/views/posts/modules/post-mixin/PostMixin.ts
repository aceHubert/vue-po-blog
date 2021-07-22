import { Vue, Component } from 'nuxt-property-decorator';
import { gql } from '@/includes/functions';
import { PostCommentStatus, PostStatus } from '@/includes/datas/enums';

@Component
export default class PostIndexMinix extends Vue {
  /**
   * 修改状态
   * @param id postId
   * @param status 状态
   */
  updatePostStatus(id: string, status: PostStatus) {
    return this.graphqlClient
      .mutate<{ result: boolean }, { id: string; status: PostStatus }>({
        mutation: gql`
          mutation updatePostStatus($id: ID!, $status: POST_STATUS!) {
            result: updatePostStatus(id: $id, status: $status)
          }
        `,
        variables: {
          id,
          status,
        },
      })
      .then(({ data }) => data!.result);
  }

  /**
   * 批量修改状态
   * @param ids postId
   */
  blukUpdatePostStatus(ids: string[], status: PostStatus) {
    return this.graphqlClient
      .mutate<{ result: boolean }, { ids: string[]; status: PostStatus }>({
        mutation: gql`
          mutation blukUpdatePostStatus($ids: [ID!]!, $status: POST_STATUS) {
            result: blukUpdatePostStatus(ids: $ids, status: $status)
          }
        `,
        variables: {
          ids,
          status,
        },
      })
      .then(({ data }) => data!.result);
  }

  /**
   * 修改评论状态
   * @param id postId
   * @param status 评论状态
   */
  updatePostCommentStatus(id: string, status: PostCommentStatus) {
    return this.graphqlClient
      .mutate<{ result: boolean }, { id: string; status: PostCommentStatus }>({
        mutation: gql`
          mutation updatePostCommentStatus($id: ID!, $status: POST_COMMENT_STATUS!) {
            result: updatePostCommentStatus(id: $id, status: $status)
          }
        `,
        variables: {
          id,
          status,
        },
      })
      .then(({ data }) => data!.result);
  }

  /**
   * 重置状态
   * @param id postId
   */
  restorePost(id: string) {
    return this.graphqlClient
      .mutate<{ result: boolean }, { id: string }>({
        mutation: gql`
          mutation restorePost($id: ID!) {
            result: restorePost(id: $id)
          }
        `,
        variables: {
          id,
        },
      })
      .then(({ data }) => data!.result);
  }

  /**
   * 批量重置状态
   * @param ids postIds
   */
  blukRestorePost(ids: string[]) {
    return this.graphqlClient
      .mutate<{ result: boolean }, { ids: string[] }>({
        mutation: gql`
          mutation blukRestore($ids: [ID!]!) {
            result: blukRestorePost(ids: $ids)
          }
        `,
        variables: {
          ids,
        },
      })
      .then(({ data }) => data?.result);
  }

  /**
   * 删除
   * @param id postId
   */
  deletePost(id: string) {
    return this.graphqlClient
      .mutate<{ result: boolean }, { id: string }>({
        mutation: gql`
          mutation deletePost($id: ID!) {
            result: deletePost(id: $id)
          }
        `,
        variables: {
          id,
        },
      })
      .then(({ data }) => data!.result);
  }

  /**
   * 批量删除
   * @param ids postId
   */
  blukDeletePost(ids: string[]) {
    return this.graphqlClient
      .mutate<{ result: boolean }, { ids: string[] }>({
        mutation: gql`
          mutation deletePost($id: [ID!]) {
            result: bulkDeletePost(ids: $ids)
          }
        `,
        variables: {
          ids,
        },
      })
      .then(({ data }) => data!.result);
  }
}
