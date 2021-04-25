/**
 * Term 相关的增、删、改功能
 */
import { Component, Ref, mixins } from 'nuxt-property-decorator';
import { gql, formatError } from '@/includes/functions';
import { PostCommentStatus, PostStatus, PostVisibility, UserCapability, TermTaxonomy } from '@/includes/datas';
import { PostEditForm } from '@/components';
import { termMixin, postMixin } from '@/mixins';

// Types
import { Post, PostCreationModel, PostUpdateModel } from 'types/datas/post';
import { Term } from 'types/datas/term';

@Component({
  asyncData({ route, error, $i18n, graphqlClient }) {
    let promisify;
    if (route.name === 'posts-edit') {
      promisify = graphqlClient
        .query<{ post?: Post }, { id: string }>({
          query: gql`
            query getPost($id: ID!) {
              post(id: $id) {
                id
                title
                content
                excerpt
                author {
                  id
                  displayName
                }
                status
                commentStatus
              }
            }
          `,
          variables: {
            id: route.params.id,
          },
        })
        .then(({ data }) => {
          if (!data.post) {
            return error({
              statusCode: 500,
              message: $i18n.tv('post.tips.notExists', 'Post is not exists!') as string,
            });
          } else if (data.post.status === PostStatus.Trash) {
            return error({
              statusCode: 500,
              message: $i18n.tv('post.tips.trashStatusEdit', 'Could not edit "trash" status Post') as string,
            });
          }
          return data.post;
        });
    } else {
      promisify = graphqlClient
        .mutate<{ post: Post }, { model: PostCreationModel }>({
          mutation: gql`
            mutation addPost($model: NewPostInput!) {
              post: addPost(model: $model) {
                id
                title
                content
                excerpt
                author {
                  id
                  displayName
                }
                status
                commentStatus
              }
            }
          `,
          variables: {
            model: {
              title: '',
              content: '',
              excerpt: '',
            },
          },
        })
        .then(({ data }) => data!.post);
    }

    return promisify
      .then((post) => {
        if (!post) return;

        return graphqlClient
          .query<
            {
              tags: Term[];
              myTags: Array<{ taxonomyId: string }>;
              categories: Term[];
              myCategories: Array<{ taxonomyId: number }>;
            },
            { id: string }
          >({
            query: gql`
              query getTerms($id: ID!) {
                tags: terms(taxonomy: "tag") {
                  taxonomyId
                  name
                }
                myTags: termsByObjectId(objectId: $id, taxonomy: "tag") {
                  taxonomyId
                }
                categories: terms(taxonomy: "category") {
                  taxonomyId
                  name
                  parentId
                }
                myCategories: termsByObjectId(objectId: $id, taxonomy: "category") {
                  taxonomyId
                }
              }
            `,
            variables: {
              id: post.id,
            },
          })
          .then(({ data }) => ({
            post: post,
            status: post.status,
            visibility: post.status === PostStatus.Private ? PostVisibility.Private : PostVisibility.Public,
            allowComments: post.commentStatus === PostCommentStatus.Enable,
            // a-select options
            allTags: data.tags.map(({ taxonomyId, name }) => ({
              value: taxonomyId,
              label: name,
            })),
            selectedTags: data.myTags.map(({ taxonomyId }) => taxonomyId),
            // a-tree treeData(sync)
            allCategories: (function formatToTree(categories: Term[], pId = '0'): TreeData[] {
              return categories
                .filter((item) => item.parentId === pId)
                .map(({ taxonomyId, name }) => ({
                  key: taxonomyId,
                  title: name,
                  children: formatToTree(categories, taxonomyId),
                }));
            })(data.categories),
            checkedCagegoryKeys: data.myCategories.map(({ taxonomyId }) => taxonomyId),
          }));
      })
      .catch((err) => {
        const { statusCode, message } = formatError(err);
        error({ statusCode, message });
      });
  },
})
export default class PostEditMixin extends mixins(postMixin, termMixin) {
  @Ref('editForm') editForm!: PostEditForm;

  allTags!: Array<{ label: string; value: string }>;
  selectedTags!: string[];
  allCategories!: TreeData[];
  checkedCagegoryKeys!: number[];
  thumbnailList!: any[];
  status!: PostStatus;
  visibility!: PostVisibility;
  visibilityPopShown!: boolean;
  allowComments!: boolean;
  allowCommentsChanging!: boolean;
  post!: Post;

  data() {
    return {
      allTags: [],
      selectedTags: [],
      allCategories: [],
      checkedCagegoryKeys: [],
      status: PostStatus.Draft,
      visibility: PostVisibility.Public,
      visibilityPopShown: false,
      allowComments: false,
      allowCommentsChanging: false,
      disabledActions: false,
      thumbnailList: [],
      post: {},
    };
  }

  get hasPublishCapability() {
    return this.hasCapability(UserCapability.PublishPosts);
  }

  onUpdatePost(model: PostUpdateModel) {
    return this.graphqlClient
      .mutate<{ result: boolean }, { id: string; model: PostUpdateModel }>({
        mutation: gql`
          mutation modifyPost($id: ID!, $model: UpdatePostInput!) {
            result: modifyPost(id: $id, model: $model)
          }
        `,
        variables: {
          id: this.post.id,
          model,
        },
      })
      .then(({ data }) => {
        if (data!.result) {
          // 新建保存后跳转到编辑页面
          if (this.$route.name === 'posts-create') {
            this.$router.replace({ name: 'posts-edit', params: { id: this.post.id } });
          } else {
            this.$message.success(this.$tv('post.tips.updateSuccessful', `Update post successful!`) as string);
          }
        } else {
          this.$message.error(this.$tv('post.tips.updateFaild', 'An error occurred while updating post!') as string);
        }
        return data!.result;
      })
      .catch((err) => {
        const { message } = formatError(err);
        this.$message.error(message);
        return false;
      });
  }

  onUpdatePostStatus(status: PostStatus) {
    return this.modifyPostStatus(this.post.id, status)
      .then((result) => {
        if (!result) {
          this.$message.error(
            this.$tv('post.tips.updateStatusFaild', 'An error occurred while updating post status!') as string,
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

  handleTagSelect(nameOrId: string) {
    let promisify = Promise.resolve(nameOrId);

    // 如果是手动输入的tag, 先添加得到返回的key
    if (!this.allTags.some((tag) => tag.value === nameOrId)) {
      promisify = this.createTerm({ name: nameOrId, description: '' }, TermTaxonomy.Tag).then(
        ({ taxonomyId, name }) => {
          this.allTags.push({
            value: taxonomyId,
            label: name,
          });
          return taxonomyId;
        },
      );
    }

    return promisify
      .then((key) => {
        this.selectedTags.push(key);
        return this.createTermRelationship(this.post.id, key);
      })
      .catch((err) => {
        const { message } = formatError(err);
        this.$message.error(message);
      });
  }

  handleTagDeselect(value: string) {
    return this.deleteTermRelationship(this.post.id, value).then(() => {
      this.selectedTags = this.selectedTags.filter((key) => key !== value);
    });
  }

  handCategoryChecked(selectedKeys: string[], { checked, node }: { checked: boolean; node: any }) {
    // node.loading = true;
    if (checked) {
      return this.createTermRelationship(this.post.id, node.dataRef.key).then(() => {
        this.checkedCagegoryKeys.push(node.dataRef.key);
      });
    } else {
      return this.deleteTermRelationship(this.post.id, node.dataRef.key).then(() => {
        this.checkedCagegoryKeys = this.checkedCagegoryKeys.filter((key) => key !== node.dataRef.key);
      });
    }
  }

  handleAllowCommentsChange() {
    this.allowCommentsChanging = true;
    this.graphqlClient
      .mutate<{ result: boolean }, { id: string; status: PostCommentStatus }>({
        mutation: gql`
          mutation modifyPostCommentStatus($id: ID!, $status: POST_COMMENT_STATUS!) {
            result: modifyPostOrPageCommentStatus(id: $id, status: $status)
          }
        `,
        variables: {
          id: this.post.id,
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
        content: this.$tv('post.tips.privateAlert', 'Would you like to privately publish this post now?'),
        okText: this.$tv(`post.btnText.privatelyOkTest`, 'Yes') as string,
        cancelText: this.$tv('post.btnText.privatelyCancelTest', 'No') as string,
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
