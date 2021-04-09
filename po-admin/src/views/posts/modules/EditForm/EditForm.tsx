import { Vue, Component, Prop, Watch } from 'nuxt-property-decorator';
import { modifiers as m } from 'vue-tsx-support';
import { gql, formatError } from '@/includes/functions';
import { PostStatus, PostCommentStatus, TermTaxonomy } from '@/includes/datas/enums';
// import { isPlainObject } from '@vue-async/utils';
import LogoSvg from '@/assets/images/logo.svg?inline';
import classes from './EditForm.less?module';

// Types
import * as tsx from 'vue-tsx-support';
import { WrappedFormUtils } from 'ant-design-vue/types/form/form';
import { Term, TermCreationModel, TermRelationship, TermRelationshipCreationModel } from 'types/datas/term';
import { PostUpdateModel, Post } from 'types/datas/post';

export type TreeData = {
  title: string;
  key: string;
  children?: TreeData[];
};

/**
 * this.editModel.parent || this.editModel.id
 * 当新建时是原始文章，使用id
 * 当修改时是创建的副本，parent 才是原始id
 */
@Component<PostEditForm>({
  name: 'PostEditForm',
  fetch() {
    // 获取标签和分类
    return this.graphqlClient
      .query<
        {
          tags: Term[];
          myTags: Array<{ taxonomyId: string }>;
          categories: Term[];
          myCategories: Array<{ taxonomyId: number }>;
        },
        { objectId: string }
      >({
        query: gql`
          query getTerms($objectId: ID!) {
            tags: terms(taxonomy: "tag") {
              taxonomyId
              name
            }
            myTags: termRelationships(objectId: $objectId, taxonomy: "tag") {
              taxonomyId
            }
            categories: terms(taxonomy: "category") {
              taxonomyId
              name
              parentId
            }
            myCategories: termRelationships(objectId: $objectId, taxonomy: "category") {
              taxonomyId
            }
          }
        `,
        variables: {
          objectId: this.editModel.parent || this.editModel.id,
        },
      })
      .then(({ data }) => {
        // a-select options
        this.allTags = data.tags.map(({ taxonomyId, name }) => ({
          value: taxonomyId,
          label: name,
        }));
        this.selectedTags = data.myTags.map(({ taxonomyId }) => taxonomyId);
        // a-tree treeData(sync)
        this.allCategories = (function formatToTree(categories: Term[], pId = '0'): TreeData[] {
          return categories
            .filter((item) => item.parentId === pId)
            .map(({ taxonomyId, name }) => ({
              key: taxonomyId,
              title: name,
              children: formatToTree(categories, taxonomyId),
            }));
        })(data.categories);
        this.checkedCagegoryKeys = data.myCategories.map(({ taxonomyId }) => taxonomyId);
      })
      .catch((err) => {
        const { message } = formatError(err);
        this.$message.error(message);
      });
  },
})
export default class PostEditForm extends Vue {
  _tsx!: tsx.DeclareProps<tsx.PickProps<PostEditForm, 'fromCreate' | 'editModel'>> &
    tsx.DeclareOnEvents<{
      onChange: (values: Dictionary<any>) => void;
      onStatusChange: (status: PostStatus) => void;
    }>;

  // 新建
  // 在新建的时候是先生成了一条 autoDraft 的数据，用于区分是新建还是修改流程
  @Prop({ type: Boolean, default: false }) fromCreate?: boolean;
  @Prop({ type: Object, required: true, validator: (val) => !!val.id }) editModel!: Post;

  // form
  form!: WrappedFormUtils;
  rules!: Dictionary<any>;

  allTags!: Array<{ label: string; value: string }>;
  selectedTags!: string[];
  allCategories!: TreeData[];
  checkedCagegoryKeys!: number[];
  status!: PostStatus;
  content!: string;
  thumbnailList!: any[];
  allowComments!: boolean;
  allowCommentsChanging!: boolean;
  changed!: boolean; // Post 对象值改变
  savingToDarft!: boolean; // 状态变化 => handleSaveToDarft()
  publishing!: boolean; // 状态变化 => handlePublish()
  updating!: boolean; // 状态无变化 => handleUpdate()
  makingPrivate!: boolean; // 状态变化 => handleMakePrivate()
  siderCollapsed!: boolean; // 展开侧边栏

  data() {
    return {
      allTags: [],
      selectedTags: [],
      allCategories: [],
      checkedCagegoryKeys: [],
      allowComments: this.editModel.commentStatus === PostCommentStatus.Enable,
      allowCommentsChanging: false,
      status: this.editModel.status,
      content: this.editModel.content,
      thumbnailList: [],
      changed: false,
      savingToDarft: false,
      publishing: false,
      updating: false,
      makingPrivate: false,
      siderCollapsed: false,
    };
  }

  get processing() {
    return this.savingToDarft || this.publishing || this.updating;
  }

  get editorConfig() {
    return {
      toolbar: ['bold', 'italic', '|', 'link'],
    };
  }

  @Watch('content')
  watchChange() {
    this.changed = true;
  }

  // 添加标签
  addTag(name: string) {
    return this.graphqlClient
      .mutate<{ tag: Term }, { model: TermCreationModel & { taxonomy: 'tag' } }>({
        mutation: gql`
          mutation addTerm($model: NewTermInput!) {
            tag: addTerm(model: $model) {
              taxonomyId
              name
            }
          }
        `,
        variables: {
          model: {
            name,
            taxonomy: TermTaxonomy.Tag,
          },
        },
      })
      .then(({ data }) => {
        this.allTags.push({
          value: data!.tag.taxonomyId,
          label: data!.tag.name,
        });
        return data!.tag.taxonomyId;
      });
  }

  // 添加关系，tag/category 可以共用
  addRelationship(taxonomyId: string) {
    return this.graphqlClient
      .mutate<{ relationship: TermRelationship }, { model: TermRelationshipCreationModel }>({
        mutation: gql`
          mutation addTermRelationship($model: NewTermRelationshipInput!) {
            relationship: addTermRelationship(model: $model) {
              objectId
              taxonomyId
            }
          }
        `,
        variables: {
          model: {
            objectId: this.editModel.parent || this.editModel.id,
            taxonomyId: taxonomyId,
          },
        },
      })
      .then(({ data }) => data?.relationship)
      .catch((err) => {
        const { message } = formatError(err);
        this.$message.error(message);
      });
  }

  // 移除关系，tag/category 可以共用
  removeRelationship(taxonomyId: string) {
    return this.graphqlClient
      .mutate<{ result: boolean }, { objectId: string; taxonomyId: string }>({
        mutation: gql`
          mutation removeTermRelationship($objectId: ID!, $taxonomyId: ID!) {
            result: removeTermRelationship(objectId: $objectId, taxonomyId: $taxonomyId)
          }
        `,
        variables: {
          objectId: this.editModel.parent || this.editModel.id,
          taxonomyId: taxonomyId,
        },
      })
      .then(({ data }) => !!data?.result)
      .catch((err) => {
        const { message } = formatError(err);
        this.$message.error(message);
      });
  }

  // 修改文章
  updatePost(status?: PostStatus) {
    return new Promise((resolve, reject) => {
      this.form.validateFieldsAndScroll((error, values) => {
        if (error) {
          return reject(error);
        }

        const updateParams: PostUpdateModel = {
          ...values,
          content: this.content,
          status,
        };

        this.graphqlClient
          .mutate<{ result: boolean }, { id: string; model: PostUpdateModel }>({
            mutation: gql`
              mutation modifyPost($id: ID!, $model: UpdatePostInput!) {
                result: modifyPost(id: $id, model: $model)
              }
            `,
            variables: {
              id: this.editModel.id,
              model: updateParams,
            },
          })
          .then(({ data }) => {
            if (data?.result) {
              this.$emit('change', this.form.getFieldsValue());
              this.changed = false;
            }
            resolve(data?.result);
          })
          .catch((err) => {
            const { message } = formatError(err);
            this.$message.error(message);
            reject(new Error(message));
          });
      });
    });
  }

  // 修改状态
  updatePostStatus(status: PostStatus) {
    return this.graphqlClient
      .mutate<{ result: boolean }, { id: string; status: PostStatus }>({
        mutation: gql`
          mutation modifyPostStatus($id: ID!, $status: POST_STATUS_WITHOUT_AUTO_DRAFT!) {
            result: modifyPostOrPageStatus(id: $id, status: $status)
          }
        `,
        variables: {
          id: this.editModel.parent || this.editModel.id,
          status,
        },
      })
      .then(({ data }) => !!data?.result)
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

  handleTagSelect(name: string) {
    let promisify = Promise.resolve(name);

    // 如果是手动输入的tag, 先添加得到返回的key
    if (!this.allTags.some((tag) => tag.value === name)) {
      promisify = this.addTag(name);
    }

    promisify.then((key) => {
      this.selectedTags.push(key);
      return this.addRelationship(key);
    });
  }

  handleTagDeselect(value: string) {
    this.removeRelationship(value).then(() => {
      this.selectedTags = this.selectedTags.filter((key) => key !== value);
    });
  }

  handCategoryChecked(selectedKeys: string[], { checked, node }: { checked: boolean; node: any }) {
    // node.loading = true;
    if (checked) {
      this.addRelationship(node.dataRef.key).then(() => {
        this.checkedCagegoryKeys.push(node.dataRef.key);
      });
    } else {
      this.removeRelationship(node.dataRef.key).then(() => {
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
            result: modifyPostCommentStatus(id: $id, status: $status)
          }
        `,
        variables: {
          id: this.editModel.id,
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

  // 修改post 但不会修改状态
  handleUpdate() {
    this.updating = true;
    this.updatePost().finally(() => {
      this.updating = false;
    });
  }

  // 修改post 并将状态修改为draft
  handleSaveToDraft() {
    this.savingToDarft = true;
    const status = PostStatus.Draft;
    this.updatePost(status)
      .then((result) => {
        if (result) {
          this.$emit('statusChanged', status);
          this.status = status;
        }
      })
      .finally(() => {
        this.savingToDarft = false;
      });
  }

  // 修改post 并将状态修改为publish
  handelPublish() {
    this.publishing = true;
    const status = PostStatus.Publish;
    this.updatePost(status)
      .then((result) => {
        if (result) {
          this.$emit('statusChanged', status);
          this.status = status;
        }
      })
      .finally(() => {
        this.publishing = false;
      });
  }

  // 仅修改状态为 private, 不修改post
  handleMakePrivate() {
    this.makingPrivate = true;
    const status = PostStatus.Private;
    this.updatePostStatus(status)
      .then((result) => {
        if (result) {
          this.$emit('statusChanged', status);
          this.status = status;
        }
      })
      .finally(() => {
        this.makingPrivate = false;
      });
  }

  created() {
    if (this.editModel.status === PostStatus.Trash) {
      this.$nuxt.error({
        statusCode: 500,
        message: this.$tv('post.tips.trashStatusEdit', 'Could not edit "trash" status Post') as string,
      });
      return;
    }
    this.form = this.$form.createForm(this, {
      name: 'post_form',
      mapPropsToFields: () => {
        // 默认值
        return Object.keys(this.editModel).reduce((prev: Dictionary<any>, key) => {
          prev[key] = this.$form.createFormField({
            value: this.editModel[key as keyof Post],
          });
          return prev;
        }, {});
      },
      onValuesChange: (props: any, values: any) => {
        this.changed = true;
        const pureValue = Object.assign({}, this.form.getFieldsValue(), values);
        this.$emit('change', pureValue);
      },
    });

    this.rules = {
      title: [
        {
          required: true,
          message: this.$tv('post.form.titleRequired', 'Title is required'),
          whitespace: true,
        },
      ],
    };
  }

  render() {
    return (
      <a-layout class={[classes.wrapper]}>
        <a-layout-header>
          <a-row gutter={16} type="flex" justify="space-between">
            <a-col flex={0}>
              <a-space>
                <nuxt-link to={{ name: 'home' }} class={[classes.logo]}>
                  <LogoSvg />
                </nuxt-link>
              </a-space>
            </a-col>
            <a-col flex={1} class={['text-right']}>
              <a-space>
                {this.status === PostStatus.Publish || this.status === PostStatus.Private
                  ? [
                      <a-button
                        ghost
                        type="primary"
                        disabled={this.processing}
                        loading={this.savingToDarft}
                        title={this.$tv('post.btnTips.switchToDraft', 'swith the post into draft box')}
                        onClick={m.stop.prevent(this.handleSaveToDraft.bind(this))}
                      >
                        {this.$tv('post.btnText.switchToDraft', 'Switch to Draft')}
                      </a-button>,
                      <a-button
                        type="primary"
                        disabled={!this.changed || this.processing}
                        loading={this.updating}
                        title={this.$tv('post.btnTips.update', 'Update the post')}
                        onClick={m.stop.prevent(this.handleUpdate.bind(this))}
                      >
                        {this.$tv('post.btnText.update', 'Update')}
                      </a-button>,
                    ]
                  : [
                      <a-button
                        ghost
                        type="primary"
                        disabled={this.processing}
                        loading={this.savingToDarft}
                        title={this.$tv('post.btnTips.saveToDraft', 'Save the post into draft box')}
                        onClick={m.stop.prevent(this.handleSaveToDraft.bind(this))}
                      >
                        {this.$tv('post.btnText.saveToDraft', 'Save to Draft')}
                      </a-button>,
                      <a-button
                        type="primary"
                        disabled={this.processing}
                        loading={this.publishing}
                        title={this.$tv('post.btnTips.publish', 'Publish the post')}
                        onClick={m.stop.prevent(this.handelPublish.bind(this, false))}
                      >
                        {this.$tv('post.btnText.publish', 'Publish')}
                      </a-button>,
                    ]}
                <a-button disabled={!this.siderCollapsed} onClick={() => (this.siderCollapsed = false)}>
                  <a-icon type="setting"></a-icon>
                </a-button>
              </a-space>
            </a-col>
          </a-row>
          {/* <a-drawer
          title={this.$tv('post.publishDrawerTitle', 'Publish Settings')}
          placement="right"
          closable={false}
          mask={false}
          visible={true}
        ></a-drawer> */}
        </a-layout-header>
        <a-layout>
          <a-layout-content>
            <client-only>
              <rich-editor
                vModel={this.content}
                config={this.editorConfig}
                placeholder={this.$tv('post.contentPlaceholder', 'Please input content')}
                class={[classes.editor, 'grey lighten-4']}
              />
            </client-only>
          </a-layout-content>
          <a-layout-sider width="300" collapsed={this.siderCollapsed} collapsedWidth={0}>
            <a-card title={this.$tv('post.form.settingsTitle', 'Settings')} bordered={false}>
              <template slot="extra">
                <a-icon type="close" onClick={() => (this.siderCollapsed = !this.siderCollapsed)}></a-icon>
              </template>
              <a-form form={this.form} class="px-4 py-3">
                <a-form-item label={this.$tv('post.form.title', 'Title')}>
                  <a-input
                    placeholder={this.$tv('post.form.titlePlaceholder', 'Please input title')}
                    {...{ directives: [{ name: 'decorator', value: ['title', { rules: this.rules.title }] }] }}
                  />
                </a-form-item>
                <a-form-item
                  label={this.$tv('post.form.excerpt', 'Excerpt')}
                  help={this.$tv('post.form.excerptHelp', 'Write an excerpt(optional)')}
                  hasFeedback={false}
                >
                  <a-textarea
                    placeholder={this.$tv('post.form.excerptPlaceholder', 'Please input excerpt')}
                    {...{ directives: [{ name: 'decorator', value: ['excerpt'] }] }}
                  />
                </a-form-item>
              </a-form>

              <a-divider class="my-0"></a-divider>

              {!this.$fetchState.pending ? (
                <a-collapse bordered={false} expand-icon-position="right" class="shades transparent">
                  <a-collapse-panel header={this.$tv('post.form.thumbnail', 'Thumbnail')}>
                    <a-upload
                      action="/api/plumemo-server/v1/file/upload/"
                      class="upload-list-inline"
                      listType="picture-card"
                      fileList={this.thumbnailList}
                      beforeUpload={this.beforeThumbnailUpload.bind(this)}
                      onChange={this.handleThumbnailChange.bind(this)}
                    >
                      {!this.thumbnailList.length
                        ? [
                            <a-icon type="plus" />,
                            <div class="ant-upload-text">{this.$tv('post.btnText.upload', 'Upload')}</div>,
                          ]
                        : null}
                    </a-upload>
                  </a-collapse-panel>
                  <a-collapse-panel header={this.$tv('post.form.categoryTitle', 'Categories')}>
                    <div class="mb-3">
                      <a-tree
                        checkable
                        checkStrictly
                        checkedKeys={this.checkedCagegoryKeys}
                        selectable={false}
                        treeData={this.allCategories}
                        onCheck={this.handCategoryChecked.bind(this)}
                      ></a-tree>
                    </div>
                    <nuxt-link to={{ name: 'categories' }}>
                      {this.$tv('post.form.addCategoryLinkText', 'Add Cagetory')}
                    </nuxt-link>
                  </a-collapse-panel>
                  <a-collapse-panel header={this.$tv('post.form.tagTitle', 'Tags')}>
                    <a-select
                      value={this.selectedTags}
                      options={this.allTags}
                      maxTagCount={10}
                      mode="tags"
                      optionFilterProp="children"
                      placeholder={this.$tv('post.form.tagPlaceholder', 'Please choose/input a tag')}
                      style="width:100%"
                      class="mb-3"
                      onSelect={this.handleTagSelect.bind(this)}
                      onDeselect={this.handleTagDeselect.bind(this)}
                      onSearch={() => {}}
                    ></a-select>
                    <nuxt-link to={{ name: 'tags' }}>
                      {this.$tv('post.form.tagManagementLinkText', 'Tag Management')}
                    </nuxt-link>
                  </a-collapse-panel>
                  <a-collapse-panel header={this.$tv('post.form.discusionTitle', 'Discusion')}>
                    <a-checkbox
                      checked={this.allowComments}
                      disabled={this.allowCommentsChanging}
                      onChange={this.handleAllowCommentsChange.bind(this)}
                    >
                      {this.$tv('post.form.allowCommentCheckboxText', 'Allow comments')}
                    </a-checkbox>
                  </a-collapse-panel>
                </a-collapse>
              ) : null}
            </a-card>
          </a-layout-sider>
        </a-layout>
      </a-layout>
    );
  }
}
