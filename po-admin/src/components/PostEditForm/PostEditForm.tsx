import { Vue, Component, Prop, Watch } from 'nuxt-property-decorator';
import { modifiers as m } from 'vue-tsx-support';
import { PostStatus } from '@/includes/datas/enums';
// import { isPlainObject } from '@vue-async/utils';
import LogoSvg from '@/assets/images/logo.svg?inline';
import classes from './PostEditForm.less?module';

// Types
import * as tsx from 'vue-tsx-support';
import { WrappedFormUtils } from 'ant-design-vue/types/form/form';
import { Post, PostUpdateModel } from 'types/datas/post';
import { Page, PageUpdateModel } from 'types/datas/page';

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
})
export default class PostEditForm extends Vue {
  _tsx!: tsx.DeclareProps<
    tsx.PickProps<PostEditForm, 'editModel' | 'updatePost' | 'updatePostStatus' | 'disabledActions' | 'isPage'>
  > &
    tsx.DeclareOnEvents<{
      onChange: (values: Dictionary<any>) => void;
      onStatusChange: (status: PostStatus) => void;
    }>;

  $scopedSlots!: tsx.InnerScopedSlots<{
    /** 跟在 form-item 之后，form 内部 */
    formItemAppend?: void;
    /** 跟在 form之后 */
    formAppend?: void;
  }>;

  /** 修改的实体 */
  @Prop({ type: Object, required: true, validator: (val) => !!val.id }) editModel!: Post | Page;
  /** 修改实体 */
  @Prop({ type: Function, required: true }) updatePost!: (model: PostUpdateModel | PageUpdateModel) => Promise<boolean>;
  /** 修改状态 */
  @Prop({ type: Function, required: true }) updatePostStatus!: (status: PostStatus) => Promise<void>;
  /** 右上角操作按纽禁用 */
  @Prop(Boolean) disabledActions?: boolean;
  /** 是否是页面（locale 前缀变成 "page.", 不显示 excerpt） */
  @Prop(Boolean) isPage?: boolean;

  // form
  form!: WrappedFormUtils;
  rules!: Dictionary<any>;

  // data
  status!: PostStatus;
  content!: string;
  changed!: boolean; // Post 对象值改变
  savingToDarft!: boolean; // 状态变化 => handleSaveToDarft()
  publishing!: boolean; // 状态变化 => handlePublish()
  updating!: boolean; // 状态无变化 => handleUpdate()
  makingPrivate!: boolean; // 状态变化 => handleMakePrivate()
  siderCollapsed!: boolean; // 展开侧边栏

  data() {
    return {
      status: this.editModel.status,
      content: this.editModel.content,
      changed: false,
      savingToDarft: false,
      publishing: false,
      updating: false,
      makingPrivate: false,
      siderCollapsed: false,
    };
  }

  get processing() {
    return this.savingToDarft || this.publishing || this.makingPrivate || this.updating;
  }

  get editorConfig() {
    return {
      toolbar: ['bold', 'italic', '|', 'link'],
    };
  }

  get taxonomy() {
    return this.isPage ? 'page' : 'post';
  }

  @Watch('content')
  watchChange() {
    this.changed = true;
  }

  // 修改文章(表单验证)
  onUpdatePost(status?: PostStatus) {
    return new Promise((resolve, reject) => {
      this.form.validateFieldsAndScroll((error, values) => {
        if (error) {
          return reject(error);
        }

        this.updatePost({
          ...values,
          content: this.content,
          status: status || this.status, // 如果没有传值，则使用原状态（可被修改）
        })
          .then((result) => {
            if (result) {
              this.changed = false;
              resolve(null);
            } else {
              reject();
            }
          })
          .catch((err) => {
            reject(err);
          });
      });
    });
  }

  // 修改post 但不会修改状态
  handleUpdate() {
    this.updating = true;
    this.onUpdatePost().finally(() => {
      this.updating = false;
    });
  }

  // 修改post 并将状态修改为draft （当 status 是 private 时，不改变状态）
  handleSaveToDraft() {
    this.savingToDarft = true;
    const status = this.status === PostStatus.Private ? PostStatus.Private : PostStatus.Draft;
    this.onUpdatePost(status)
      .then(() => {
        this.$emit('statusChange', status);
        this.status = status;
      })
      .finally(() => {
        this.savingToDarft = false;
      });
  }

  // 修改post 并将状态修改为draft （当 status 是 private 时，强制修改成 draft, 显示将会变为public）
  handleSwitchToDraft() {
    this.$confirm({
      content: this.$tv(
        `${this.taxonomy}.tips.unpublisheAlert`,
        `Are you sure you want to unpublish this ${this.taxonomy}?`,
      ),
      okText: this.$tv(`${this.taxonomy}.btnText.unpublishOkText`, 'Yes') as string,
      cancelText: this.$tv(`${this.taxonomy}.btnText.unpublishCancelText`, 'No') as string,
      onOk: () => {
        this.savingToDarft = true;
        const status = PostStatus.Draft;
        this.onUpdatePost(status)
          .then(() => {
            this.$emit('statusChange', status);
            this.status = status;
          })
          .finally(() => {
            this.savingToDarft = false;
          });
      },
    });
  }

  // 修改post 并将状态修改为 publish（当 status 是 private 时，不改变状态）
  handelPublish() {
    this.publishing = true;
    const status = this.status === PostStatus.Private ? PostStatus.Private : PostStatus.Publish;
    this.onUpdatePost(status)
      .then(() => {
        this.$emit('statusChange', status);
        this.status = status;
      })
      .finally(() => {
        this.publishing = false;
      });
  }

  // 修改post 并将状态修改为 private
  handleMakePrivate() {
    this.makingPrivate = true;
    const status = PostStatus.Private;
    this.onUpdatePost(status)
      .then(() => {
        this.$emit('statusChange', status);
        this.status = status;
      })
      .finally(() => {
        this.makingPrivate = false;
      });
  }

  created() {
    this.form = this.$form.createForm(this, {
      name: 'post_form',
      mapPropsToFields: () => {
        // 默认值
        return Object.keys(this.editModel).reduce((prev: Dictionary<any>, key) => {
          prev[key] = this.$form.createFormField({
            value: (this.editModel as any)[key],
          });
          return prev;
        }, {});
      },
      onValuesChange: (props: any, values: any) => {
        this.changed = true;
        const pureValue = Object.assign({}, this.form.getFieldsValue(), values);
        this.$emit('input', pureValue);
        this.$emit('change', pureValue);
      },
    });
  }

  render() {
    return (
      <a-layout class={[classes.wrapper]}>
        <a-layout-header>
          <a-row gutter={16} type="flex" justify="space-between">
            <a-col flex={0}>
              <a-space>
                <a href="javascript:;" class={[classes.logo]} onClick={() => this.$router.back()}>
                  <LogoSvg />
                </a>
              </a-space>
            </a-col>
            <a-col flex={1} class={['text-right']}>
              <a-space>
                {this.status === PostStatus.Publish || this.status === PostStatus.Private
                  ? [
                      <a-button
                        ghost
                        type="primary"
                        disabled={this.processing || this.disabledActions}
                        loading={this.savingToDarft}
                        title={this.$tv(`${this.taxonomy}.btnTips.switchToDraft`, 'swith the post into draft box')}
                        onClick={m.stop.prevent(this.handleSwitchToDraft.bind(this))}
                      >
                        {this.$tv(`${this.taxonomy}.btnText.switchToDraft`, 'Switch to Draft')}
                      </a-button>,
                      <a-button
                        type="primary"
                        disabled={!this.changed || this.processing || this.disabledActions}
                        loading={this.updating}
                        title={this.$tv(`${this.taxonomy}.btnTips.update`, 'Update the post')}
                        onClick={m.stop.prevent(this.handleUpdate.bind(this))}
                      >
                        {this.$tv(`${this.taxonomy}.btnText.update`, 'Update')}
                      </a-button>,
                    ]
                  : [
                      <a-button
                        ghost
                        type="primary"
                        disabled={!this.changed || this.processing || this.disabledActions}
                        loading={this.savingToDarft}
                        title={this.$tv(`${this.taxonomy}.btnTips.saveToDraft`, 'Save the post into draft box')}
                        onClick={m.stop.prevent(this.handleSaveToDraft.bind(this))}
                      >
                        {this.$tv(`${this.taxonomy}.btnText.saveToDraft`, 'Save to Draft')}
                      </a-button>,
                      <a-button
                        type="primary"
                        disabled={this.processing || this.disabledActions}
                        loading={this.publishing}
                        title={this.$tv(`${this.taxonomy}.btnTips.publish`, 'Publish the post')}
                        onClick={m.stop.prevent(this.handelPublish.bind(this, false))}
                      >
                        {this.$tv(`${this.taxonomy}.btnText.publish`, 'Publish')}
                      </a-button>,
                    ]}
                <a-button disabled={!this.siderCollapsed} onClick={() => (this.siderCollapsed = false)}>
                  <a-icon type="setting"></a-icon>
                </a-button>
              </a-space>
            </a-col>
          </a-row>
          {/* <a-drawer
          title={this.$tv(`${this.taxonomy}.publishDrawerTitle`, 'Publish Settings')}
          placement="right"
          closable={false}
          mask={false}
          visible={true}
        ></a-drawer> */}
        </a-layout-header>
        <a-layout hasSider>
          <a-layout-content>
            <client-only>
              <rich-editor
                vModel={this.content}
                config={this.editorConfig}
                placeholder={this.$tv(`${this.taxonomy}.contentPlaceholder`, 'Please input content')}
                class={[classes.editor, 'grey lighten-4']}
              />
            </client-only>
          </a-layout-content>
          <a-layout-sider width="300" collapsed={this.siderCollapsed} collapsedWidth={0}>
            <a-card title={this.$tv(`${this.taxonomy}.form.settingsTitle`, 'Settings')} bordered={false}>
              <template slot="extra">
                <a-icon type="close" onClick={() => (this.siderCollapsed = !this.siderCollapsed)}></a-icon>
              </template>
              <a-form form={this.form}>
                <a-form-item class="px-3 pt-2" label={this.$tv(`${this.taxonomy}.form.title`, 'Title')}>
                  <a-input
                    placeholder={this.$tv(`${this.taxonomy}.form.titlePlaceholder`, 'Please input title')}
                    {...{ directives: [{ name: 'decorator', value: ['title'] }] }}
                  />
                </a-form-item>
                {this.$scopedSlots.formItemAppend ? this.$scopedSlots.formItemAppend() : null}
              </a-form>
              {this.$scopedSlots.formAppend ? this.$scopedSlots.formAppend() : null}
            </a-card>
          </a-layout-sider>
        </a-layout>
      </a-layout>
    );
  }
}
