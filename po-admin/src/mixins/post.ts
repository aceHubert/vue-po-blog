/**
 * Term 相关的增、删、改功能
 */
import { Vue, Component } from 'nuxt-property-decorator';
import { gql } from '@/includes/functions';
import { PostCommentStatus, PostStatus } from '@/includes/datas/enums';

@Component
export default class PostMixin extends Vue {
  /**
   * 修改状态
   * @param id postId
   * @param status 状态
   */
  modifyPostStatus(id: string, status: PostStatus) {
    return this.graphqlClient
      .mutate<{ result: boolean }, { id: string; status: PostStatus }>({
        mutation: gql`
          mutation modifyStatus($id: ID!, $status: POST_STATUS!) {
            result: modifyPostOrPageStatus(id: $id, status: $status)
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
  blukModifyPostStatus(ids: string[]) {
    return this.graphqlClient
      .mutate<{ result: boolean }, { ids: string[] }>({
        mutation: gql`
          mutation blukModifyStatus($ids: [ID!]!) {
            result: blukUpdatePostOrPageStatus(ids: $ids, status: Trash)
          }
        `,
        variables: {
          ids,
        },
      })
      .then(({ data }) => data!.result);
  }

  /**
   * 修改评论状态
   * @param id postId
   * @param status 评论状态
   */
  modifyPostCommentStatus(id: string, status: PostCommentStatus) {
    return this.graphqlClient
      .mutate<{ result: boolean }, { id: string; status: PostCommentStatus }>({
        mutation: gql`
          mutation modifyPostCommentStatus($id: ID!, $status: POST_COMMENT_STATUS!) {
            result: modifyPostCommentStatus(id: $id, status: $status)
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
          mutation restorePostOrPage($id: ID!) {
            result: restorePostOrPage(id: $id)
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
    this.graphqlClient
      .mutate<{ result: boolean }, { ids: string[] }>({
        mutation: gql`
          mutation blukRestore($ids: [ID!]!) {
            result: blukRestorePostOrPage(ids: $ids)
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
            result: removePostOrPage(id: $id)
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
            result: blukRemovePostOrPage(ids: $ids)
          }
        `,
        variables: {
          ids,
        },
      })
      .then(({ data }) => data!.result);
  }
}
