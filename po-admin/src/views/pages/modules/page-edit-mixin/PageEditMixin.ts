/**
 * Term 相关的增、删、改功能
 */
import { Component, Ref, mixins } from 'nuxt-property-decorator';
import { gql, formatError } from '@/includes/functions';
import { PostCommentStatus, PostStatus, PostVisibility } from '@/includes/datas/enums';
import { TermMixin } from '@/views/terms/modules';
import { PostMixin, PostEditForm } from '@/views/posts/modules';

// Types
import { Page, PageCreationModel, PageUpdateModel } from 'types/datas/page';

@Component<PageEditMixin>({
  asyncData({ route, error, $i18n, graphqlClient }) {
    let promisify;
    if (route.name === 'pages-edit') {
      promisify = graphqlClient
        .query<{ page?: Page }, { id: string }>({
          query: gql`
            query getPage($id: ID!) {
              page(id: $id) {
                id
                title
                content
                author {
                  id
                  displayName
                }
                status
                order
                commentStatus
              }
            }
          `,
          variables: {
            id: route.params.id,
          },
        })
        .then(({ data }) => {
          if (!data.page) {
            return error({
              statusCode: 500,
              message: $i18n.tv('core.page-page.tips.not_exists', 'Page is not exists!') as string,
            });
          } else if (data.page.status === PostStatus.Trash) {
            return error({
              statusCode: 500,
              message: $i18n.tv(
                'core.page-page.tips.trash_status_edit',
                'Could not edit "trash" status Page',
              ) as string,
            });
          }
          return data.page;
        });
    } else {
      promisify = graphqlClient
        .mutate<{ page: Page }, { model: PageCreationModel }>({
          mutation: gql`
            mutation createPage($model: NewPageInput!) {
              page: createPage(model: $model) {
                id
                title
                content
                author {
                  id
                  displayName
                }
                status
                order
                commentStatus
              }
            }
          `,
          variables: {
            model: {
              title: '',
              content: '',
            },
          },
        })
        .then(({ data }) => data!.page);
    }

    return promisify
      .then((page) => {
        if (!page) return;
        return {
          page,
          status: page.status,
          visibility: page.status === PostStatus.Private ? PostVisibility.Private : PostVisibility.Public,
          allowComments: page.commentStatus === PostCommentStatus.Enable,
        };
      })
      .catch((err) => {
        const { statusCode, message } = formatError(err);
        error({ statusCode, message });
      });
  },
})
export default class PageEditMixin extends mixins(PostMixin, TermMixin) {
  @Ref('editForm') editForm!: PostEditForm;

  status!: PostStatus;
  visibility!: PostVisibility;
  visibilityPopShown!: boolean;
  allowComments!: boolean;
  allowCommentsChanging!: boolean;
  thumbnailList!: any[];
  page!: Page;

  data() {
    return {
      status: PostStatus.Draft,
      visibility: PostVisibility.Public,
      visibilityPopShown: false,
      allowComments: false,
      allowCommentsChanging: false,
      thumbnailList: [],
      page: {},
    };
  }

  onUpdatePage(model: PageUpdateModel) {
    return this.graphqlClient
      .mutate<{ result: boolean }, { id: string; model: PageUpdateModel }>({
        mutation: gql`
          mutation updatePage($id: ID!, $model: UpdatePageInput!) {
            result: updatePage(id: $id, model: $model)
          }
        `,
        variables: {
          id: this.page.id,
          model,
        },
      })
      .then(({ data }) => {
        if (data!.result) {
          // 新建保存后跳转到编辑页面
          if (this.$route.name === 'pages-create') {
            this.$router.replace({ name: 'pages-edit', params: { id: this.page.id } });
          } else {
            this.$message.success(
              this.$tv('core.page-page.tips.update_successful', `Update page successful!`) as string,
            );
          }
        } else {
          this.$message.error(
            this.$tv('core.page-page.tips.update_faild', 'An error occurred while updating page!') as string,
          );
        }
        return data!.result;
      })
      .catch((err) => {
        const { message } = formatError(err);
        this.$message.error(message);
        return false;
      });
  }

  onUpdatePageStatus(status: PostStatus) {
    return this.updatePostStatus(this.page.id, status)
      .then((result) => {
        if (!result) {
          this.$message.error(
            this.$tv(
              'core.page-page.tips.update_status_faild',
              'An error occurred while updating page status!',
            ) as string,
          );
        }
      })
      .catch((err) => {
        const { message } = formatError(err);
        this.$message.error(message);
      });
  }

  beforeThumbnailUpload(file: File) {
    const isJPG = file.type === 'image/jpeg';
    if (!isJPG) {
      this.$notification.error({
        message: 'You can only upload JPG file!',
        description: '',
      });
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      this.$notification.error({
        message: 'Image must smaller than 2MB!',
        description: '',
      });
    }
    return isJPG && isLt2M;
  }

  handleThumbnailChange({ fileList }: any) {
    this.thumbnailList = fileList;
  }

  handleAllowCommentsChange() {
    this.allowCommentsChanging = true;
    this.graphqlClient
      .mutate<{ result: boolean }, { id: string; status: PostCommentStatus }>({
        mutation: gql`
          mutation updatePageCommentStatus($id: ID!, $status: POST_COMMENT_STATUS!) {
            result: updatePostOrPageCommentStatus(id: $id, status: $status)
          }
        `,
        variables: {
          id: this.page.id,
          status: this.allowComments ? PostCommentStatus.Disable : PostCommentStatus.Enable,
        },
      })
      .then((result) => {
        result && (this.allowComments = !this.allowComments);
      })
      .catch((err) => {
        const { message } = formatError(err);
        this.$message.error(message);
      })
      .finally(() => {
        this.allowCommentsChanging = false;
      });
  }

  handleVisibility() {
    this.visibilityPopShown = false;
    if (this.visibility === PostVisibility.Private) {
      this.$confirm({
        content: this.$tv(
          'core.page-post.tips.privately_confirm_content',
          'Would you like to privately publish this post now?',
        ),
        okText: this.$tv(`core.page-post.btn_text.privately_confirm_ok_text`, 'Yes') as string,
        cancelText: this.$tv('core.page-post.btn_text.privately_confirm_cancel_text', 'No') as string,
        onOk: this.editForm.handleMakePrivate.bind(this.editForm),
        onCancel: () => {
          this.visibility = this.status === PostStatus.Private ? PostVisibility.Private : PostVisibility.Public;
        },
      });
    } else {
      this.status = PostStatus.Publish;
      this.editForm.status = PostStatus.Publish;
      this.editForm.changed = true;
    }
  }

  mounted() {
    if (!this.editForm) {
      return this.$nuxt.error({
        statusCode: 500,
        message: 'Set ref="editForm" on PostEditForm component ',
      });
    }
  }
}
