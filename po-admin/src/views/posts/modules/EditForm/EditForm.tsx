import { Vue, Component, Prop, Watch } from 'nuxt-property-decorator';
import { modifiers as m } from 'vue-tsx-support';
import { graphqlClient, gql } from '@/includes/functions';
import { PostStatus, PostCommentStatus, TermTaxonomy } from '@/includes/datas/enums';
// import { isPlainObject } from '@vue-async/utils';
import { markdownOption } from '@/config/markdownOptions';
import LogoSvg from '@/assets/images/logo.svg?inline';
import classes from './EditForm.less?module';

// Types
import * as tsx from 'vue-tsx-support';
import { WrappedFormUtils } from 'ant-design-vue/types/form/form';
import { Term, TermCreationModel, TermRelationship, TermRelationshipCreationModel } from 'types/datas/term';
import { PostCreationModel, PostUpdateModel, Post } from 'types/datas/post';

@Component<PostEditForm>({
  name: 'PostEditForm',
  fetch() {
    // 获取标签和分类
    return graphqlClient
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
            }
            myCategories: termRelationships(objectId: $objectId, taxonomy: "category") {
              taxonomyId
            }
          }
        `,
        variables: {
          objectId: this.editModel.id,
        },
      })
      .then(({ data }) => {
        // a-select options
        this.allTags = data.tags.map(({ taxonomyId, name }) => ({
          value: taxonomyId,
          label: name,
        }));
        this.selectedTags = data.myTags.map(({ taxonomyId }) => taxonomyId);
        // a-tree treeData
        this.allCategories = data.categories.map(({ taxonomyId, name }) => ({
          key: taxonomyId,
          title: name,
          selectable: false,
        }));
        this.checkedCagegoryKeys = data.myCategories.map(({ taxonomyId }) => taxonomyId);
      })
      .catch((err) => {
        this.$message.error(this.$tv(err.statusCode, 'Initial Categories and Tags failed!') as string);
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
  allCategories!: Array<{ title: string; key: string; selectable: false }>;
  checkedCagegoryKeys!: number[];
  status!: PostStatus;
  content!: string;
  thumbnailList!: any[];
  allowComments!: boolean;
  allowCommentsChanging!: boolean;
  autoDraft!: boolean; // 从create进来第一次是 auto draft 状态，通过 saveToDraft 保存数据并改变为 draft 状态
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
      autoDraft: !!this.fromCreate,
      changed: false,
      savingToDarft: false,
      publishing: false,
      updating: false,
      makingPrivate: false,
      siderCollapsed: false,
    };
  }

  get editorOptions() {
    return markdownOption();
  }

  get processing() {
    return this.savingToDarft || this.publishing || this.updating;
  }

  @Watch('content')
  watchChange() {
    this.changed = true;
  }

  validate(callback: (error: Error[] | null, val?: Omit<PostCreationModel, 'status'>) => void) {
    this.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const pureValues = { ...values };
        // if (pureValues.thumbnail.file) {
        //   pureValues.thumbnail =
        //     pureValues.thumbnail.file.response && isPlainObject(pureValues.thumbnail.file.response)
        //       ? pureValues.thumbnail.file.response.extra
        //       : null;
        // } else {
        //   pureValues.thumbnail = this.editModels.thumbnail || null;
        // }

        callback(null, pureValues);
      } else {
        callback(err);
      }
    });
  }

  loadCategories(treeNode: any) {
    if (treeNode.dataRef.children) {
      return Promise.resolve();
    }
    return graphqlClient
      .query<{ categories: Term[] }, { parentId: number }>({
        query: gql`
          query getCategories($parentId: ID!) {
            categories: terms(taxonomy: "category", parentId: $parentId) {
              taxonomyId
              name
            }
          }
        `,
        variables: {
          parentId: treeNode.dataRef.key,
        },
      })
      .then(({ data }) => {
        treeNode.dataRef.children = data.categories.map(({ taxonomyId, name }) => ({
          key: taxonomyId,
          title: name,
          selectable: false,
        }));
        this.allCategories = [...this.allCategories];
      })
      .catch((err) => {
        this.$message.error(this.$tv(err.code || 500, err.message) as string);
      });
  }

  // 添加关系，tag/category 可以共用
  addRelationship(taxonomyId: string) {
    return graphqlClient.mutate<{ result: TermRelationship }, { model: TermRelationshipCreationModel }>({
      mutation: gql`
        mutation addTermRelationship($model: TermRelationshipAddModel!) {
          result: addTermRelationship(model: $model) {
            objectId
            taxonomyId
          }
        }
      `,
      variables: {
        model: {
          objectId: this.editModel.id,
          taxonomyId: taxonomyId,
        },
      },
    });
  }

  // 移除关系，tag/category 可以共用
  removeRelationship(taxonomyId: string) {
    return graphqlClient
      .mutate<{ result: boolean }, { objectId: string; taxonomyId: string }>({
        mutation: gql`
          mutation removeTermRelationship($objectId: ID!, $taxonomyId: ID!) {
            result: removeTermRelationship(objectId: $objectId, taxonomyId: $taxonomyId)
          }
        `,
        variables: {
          objectId: this.editModel.id,
          taxonomyId: taxonomyId,
        },
      })
      .then(({ data }) => data?.result);
  }

  // no catch will be triggered
  updatePost(status?: PostStatus) {
    return new Promise((resolve, reject) => {
      this.validate((error, values) => {
        if (error) {
          return reject();
        }

        const updateParams: PostUpdateModel = {
          ...values,
          content: this.content,
          status,
        };

        graphqlClient
          .mutate<{ result: boolean }, { id: string; model: PostUpdateModel }>({
            mutation: gql`
              mutation updatePost($id: ID!, $model: PostUpdateModel!) {
                result: updatePost(id: $id, model: $model)
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
              status && this.$emit('statusChanged', status);
              resolve(null);
            } else {
              reject();
            }
          })
          .catch((err) => {
            this.$message.error(this.$tv(err.code, 'Update failed, please try later again!') as string);
            reject();
          });
      });
    });
  }

  // no catch will be triggered
  updatePostStatus(status: PostStatus) {
    return graphqlClient
      .mutate<{ result: boolean }, { id: string; status: PostStatus }>({
        mutation: gql`
          mutation updatePostStatus($id: ID!, $status: POST_STATUS_WITHOUT_AUTO_DRAFT!) {
            result: updatePostOrPageStatus(id: $id, status: $status)
          }
        `,
        variables: {
          id: this.editModel.id,
          status,
        },
      })
      .then(() => {
        this.$emit('statusChanged', status);
        this.status = status;
      })
      .catch((err) => {
        this.$message.error(this.$tv(err.statusCode, 'Update status failed, please try later again!') as string);
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

  handleTagSelect(value: string) {
    let promisify = Promise.resolve(value);

    // 如果是手动输入的tag, 先添加得到返回的key
    if (!this.allTags.some((tag) => tag.value === value)) {
      promisify = graphqlClient
        .mutate<{ tag: Term }, { model: TermCreationModel }>({
          mutation: gql`
            mutation addTerm($model: TermAddModel!) {
              tag: addTerm(model: $model) {
                taxonomyId
                name
              }
            }
          `,
          variables: {
            model: {
              name: value,
              slug: value,
              taxonomy: TermTaxonomy.Tag,
              objectId: this.editModel.id,
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

    promisify
      .then((key) => {
        this.selectedTags.push(key);
      })
      .catch((err) => {
        this.$message.error(this.$tv(err.code || 500, err.message) as string);
      });
  }

  handleTagDeselect(value: string) {
    this.removeRelationship(value)
      .then(() => {
        this.selectedTags = this.selectedTags.filter((key) => key !== value);
      })
      .catch((err) => {
        this.$message.error(this.$tv(err.code || 500, err.message) as string);
      });
  }

  handCategoryChecked(selectedKeys: string[], { checked, node }: { checked: boolean; node: any }) {
    // node.loading = true;
    if (checked) {
      graphqlClient
        .mutate<{ result: TermRelationship }, { model: TermRelationshipCreationModel }>({
          mutation: gql`
            mutation addTermRelationship($model: TermRelationshipAddModel!) {
              result: addTermRelationship(model: $model) {
                objectId
                taxonomyId
              }
            }
          `,
          variables: {
            model: {
              objectId: this.editModel.id,
              taxonomyId: node.dataRef.key,
            },
          },
        })
        .then(() => {
          this.checkedCagegoryKeys.push(node.dataRef.key);
        })
        .catch((err) => {
          this.$message.error(this.$tv(err.code || 500, err.message) as string);
        })
        .finally(() => {
          // node.loading = false;
        });
    } else {
      this.removeRelationship(node.dataRef.key)
        .then(() => {
          this.checkedCagegoryKeys = this.checkedCagegoryKeys.filter((key) => key !== node.dataRef.key);
        })
        .catch((err) => {
          this.$message.error(this.$tv(err.code || 500, err.message) as string);
        })
        .finally(() => {
          // node.loading = false;
        });
    }
  }

  handleAllowCommentsChange() {
    this.allowCommentsChanging = true;
    graphqlClient
      .mutate<{ result: boolean }, { id: string; status: PostCommentStatus }>({
        mutation: gql`
          mutation updatePostCommentStatus($id: ID!, $status: POST_COMMENT_STATUS!) {
            result: updatePostCommentStatus(id: $id, status: $status)
          }
        `,
        variables: {
          id: this.editModel.id,
          status: this.allowComments ? PostCommentStatus.Disable : PostCommentStatus.Enable,
        },
      })
      .then(({ data }) => {
        data?.result && (this.allowComments = !this.allowComments);
      })
      .catch((err) => {
        this.$message.error(this.$tv(err.code || 500, err.message) as string);
      })
      .finally(() => {
        this.allowCommentsChanging = false;
      });
  }

  // 修改post 并将状态修改为draft
  handleSaveToDraft() {
    this.savingToDarft = true;
    this.updatePost(PostStatus.Draft).finally(() => {
      this.savingToDarft = false;
      this.autoDraft && (this.autoDraft = false);
    });
  }

  // 修改post 但不会修改状态
  handleUpdate() {
    this.updating = true;
    this.updatePost().finally(() => {
      this.updating = false;
    });
  }

  // 修改post 并将状态修改为publish
  handelPublish() {
    this.publishing = true;
    this.updatePost(PostStatus.Publish).finally(() => {
      this.publishing = false;
    });
  }

  // 仅修改状态为 private, 不修改post
  handleMakePrivate() {
    this.makingPrivate = true;
    this.updatePostStatus(PostStatus.Private).finally(() => {
      this.makingPrivate = false;
    });
  }

  created() {
    if (this.editModel.status === PostStatus.Trash) {
      this.$nuxt.error({
        statusCode: 500,
        message: this.$tv('post.editForm.trashStatusEdit', 'Could not edit "trash" status Post') as string,
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
          message: this.$tv('post.editForm.titleRequired', 'Title is required'),
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
                        disabled={!this.changed || this.processing}
                        loading={this.savingToDarft}
                        title={this.$tv('postCreate.btnTips.switchToDraft', 'swith the post into draft box')}
                        onClick={m.stop.prevent(this.handleSaveToDraft.bind(this))}
                      >
                        {this.$tv('postCreate.btnText.switchToDraft', 'Switch to Draft')}
                      </a-button>,
                      <a-button
                        type="primary"
                        disabled={!this.changed || this.processing}
                        loading={this.updating}
                        title={this.$tv('postCreate.btnTips.update', 'Update the post')}
                        onClick={m.stop.prevent(this.handleUpdate.bind(this))}
                      >
                        {this.$tv('postCreate.btnText.update', 'Update')}
                      </a-button>,
                    ]
                  : [
                      this.status === PostStatus.Draft && this.autoDraft ? (
                        <a-button
                          ghost
                          type="primary"
                          disabled={!this.changed || this.processing}
                          loading={this.savingToDarft}
                          title={this.$tv('postCreate.btnTips.saveToDraft', 'Save the post into draft box')}
                          onClick={m.stop.prevent(this.handleSaveToDraft.bind(this))}
                        >
                          {this.$tv('postCreate.btnText.saveToDraft', 'Save to Draft')}
                        </a-button>
                      ) : this.status === PostStatus.Draft ? (
                        <a-button
                          ghost
                          type="primary"
                          disabled={!this.changed || this.processing}
                          loading={this.updating}
                          title={this.$tv('postCreate.btnTips.save', 'Save ')}
                          onClick={m.stop.prevent(this.handleUpdate.bind(this))}
                        >
                          {this.$tv('postCreate.btnText.save', 'Save')}
                        </a-button>
                      ) : null,
                      <a-button
                        type="primary"
                        disabled={!this.changed || this.processing}
                        loading={this.publishing}
                        title={this.$tv('postCreate.btnTips.publish', 'Publish the post')}
                        onClick={m.stop.prevent(this.handelPublish.bind(this, false))}
                      >
                        {this.$tv('postCreate.btnText.publish', 'Publish')}
                      </a-button>,
                    ]}
                <a-button disabled={!this.siderCollapsed} onClick={() => (this.siderCollapsed = false)}>
                  <a-icon type="setting"></a-icon>
                </a-button>
              </a-space>
            </a-col>
          </a-row>
          {/* <a-drawer
          title={this.$tv('postCreate.publishDrawerTitle', 'Publish Settings')}
          placement="right"
          closable={false}
          mask={false}
          visible={true}
        ></a-drawer> */}
        </a-layout-header>
        <a-layout>
          <a-layout-content>
            <client-only>
              <mavon-editor
                vModel={this.content}
                toolbars={this.editorOptions}
                boxShadow={false}
                subfield={false}
                ishljs={true}
                placeholder={this.$tv('postCreate.contentPlaceholder', 'Please input content')}
                class={[classes.editor, 'grey lighten-4']}
              />
            </client-only>
          </a-layout-content>
          <a-layout-sider width="300" collapsed={this.siderCollapsed} collapsedWidth={0}>
            <a-card title={this.$tv('postCreate.settingsTitle', 'Settings')} bordered={false}>
              <template slot="extra">
                <a-icon type="close" onClick={() => (this.siderCollapsed = !this.siderCollapsed)}></a-icon>
              </template>
              <a-form form={this.form} class="px-4 py-3">
                <a-form-item label={this.$tv('post.editForm.title', 'Title')}>
                  <a-input
                    placeholder={this.$tv('post.editForm.titlePlaceholder', 'Please input title')}
                    {...{ directives: [{ name: 'decorator', value: ['title', { rules: this.rules.title }] }] }}
                  />
                </a-form-item>
                {/* <a-form-item label={this.$tv('post.editForm.author', 'Author')}>
          <a-input
            style="width: 220px; max-width: 100%"
            placeholder={this.$tv('post.editForm.authorPlaceholder', 'Please input author')}
            {...{ directives: [{ name: 'decorator', value: ['author', { rules: this.rules.author }] }] }}
          />
        </a-form-item> */}
                <a-form-item
                  label={this.$tv('post.editForm.excerpt', 'Excerpt')}
                  help={this.$tv('post.editForm.excerptHelp', 'Write an excerpt(optional)')}
                  hasFeedback={false}
                >
                  <a-textarea
                    placeholder={this.$tv('post.editForm.excerptPlaceholder', 'Please input excerpt')}
                    {...{ directives: [{ name: 'decorator', value: ['excerpt'] }] }}
                  />
                </a-form-item>
              </a-form>

              <a-divider class="my-0"></a-divider>

              {!this.$fetchState.pending ? (
                <a-collapse bordered={false} expand-icon-position="right" class="shades transparent">
                  <a-collapse-panel header={this.$tv('post.editForm.thumbnail', 'Thumbnail')}>
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
                  <a-collapse-panel header={this.$tv('post.editForm.categoryTitle', 'Categories')}>
                    <div class="mb-3">
                      <a-tree
                        checkable
                        checkStrictly
                        checkedKeys={this.checkedCagegoryKeys}
                        treeData={this.allCategories}
                        loadData={this.loadCategories.bind(this)}
                        onCheck={this.handCategoryChecked.bind(this)}
                      ></a-tree>
                    </div>
                    <nuxt-link to={{ name: 'categories-create' }}>
                      {this.$tv('postFrom.addCategoryLinkText', 'Add Cagetory')}
                    </nuxt-link>
                  </a-collapse-panel>
                  <a-collapse-panel header={this.$tv('post.editForm.tagTitle', 'Tags')}>
                    <a-select
                      value={this.selectedTags}
                      options={this.allTags}
                      maxTagCount={10}
                      mode="tags"
                      optionFilterProp="children"
                      placeholder={this.$tv('post.editForm.tagPlaceholder', 'Please choose/input a tag')}
                      onSelect={this.handleTagSelect.bind(this)}
                      onDeselect={this.handleTagDeselect.bind(this)}
                      onSearch={() => {}}
                    ></a-select>
                  </a-collapse-panel>
                  <a-collapse-panel header={this.$tv('post.editForm.discusionTitle', 'Discusion')}>
                    <a-checkbox
                      checked={this.allowComments}
                      disabled={this.allowCommentsChanging}
                      onChange={this.handleAllowCommentsChange.bind(this)}
                    >
                      {this.$tv('post.editForm.allowComments', 'Allow comments')}
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
