import { Vue, Component, Prop } from 'nuxt-property-decorator';
import { lowerCase } from 'lodash-es';
import { modifiers as m } from 'vue-tsx-support';

// Types
import * as tsx from 'vue-tsx-support';
import { WrappedFormUtils } from 'ant-design-vue/types/form/form';
import { Term, TermCreationModel, TermUpdateModel } from 'types/datas';

export type TreeData = {
  id: string | number;
  pId?: string | number;
  value: string;
  title: string;
  isLeaf?: boolean;
};

@Component<TermEditForm>({
  name: 'TermEditForm',
})
export default class TermEditForm extends Vue {
  _tsx!: tsx.DeclareProps<
    tsx.MakeOptional<
      tsx.PickProps<
        TermEditForm,
        | 'editModel'
        | 'i18nKeyPrefix'
        | 'taxonomy'
        | 'nested'
        | 'syncTreeData'
        | 'getTreeData'
        | 'createTerm'
        | 'updateTerm'
        | 'btnTitle'
        | 'btnText'
      >,
      'nested' | 'syncTreeData'
    >
  > &
    tsx.DeclareOnEvents<{
      /** 当任一值被修改 */
      onChange: (values: Dictionary<any>) => void;
    }>;

  /** 修改的对象，留空表示新建 */
  @Prop(Object) editModel?: Term;
  /** 同时作为 i18n key 前缀(末尾不用加.),  [i18nKeyPrefix].term_form.btn_text */
  @Prop({ type: String, required: true }) i18nKeyPrefix!: string;
  /** 类别 */
  @Prop({ type: String, required: true }) taxonomy!: string;
  /** 显示 parent 选择框 */
  @Prop({ type: Boolean, default: false }) nested!: boolean;
  /** getTreeData 获取到的是同步数据，将不会执行 loadData，默认：false */
  @Prop({ type: Boolean, default: false }) syncTreeData!: boolean;
  /** 获取 Tree data */
  @Prop(Function) getTreeData?: (parentId?: string | number) => Promise<TreeData[]>;
  /** 数据验证通过，执行创建方法 */
  @Prop({ type: Function, required: true }) createTerm!: (values: TermCreationModel) => Promise<void>;
  /** 数据验证通过，执行修改方法 */
  @Prop({ type: Function, required: true }) updateTerm!: (id: string, values: TermUpdateModel) => Promise<void>;
  /** 按纽 title */
  @Prop(String) btnTitle?: string;
  /** 按纽显示文字 */
  @Prop(String) btnText?: string;

  // form
  form!: WrappedFormUtils;
  rules!: Dictionary<any>;

  // data
  changed!: boolean; //  对象值改变
  submiting!: boolean;
  treeData!: TreeData[];

  data() {
    return {
      changed: false,
      submiting: false,
      treeData: [],
    };
  }

  get isCreating() {
    return !this.editModel;
  }

  // 异步加载 Tree 数据
  onLoadTreeData(treeNode: any) {
    const { id } = treeNode.dataRef;
    return this.getTreeData!(id).then((data) => {
      // 修改时，不可修改到本身及其下级
      if (!this.isCreating) {
        data = data.filter((item) => item.id !== this.editModel!.id);
      }
      this.treeData = this.treeData.concat(
        data.map((item) => ({
          ...item,
          pId: id,
        })),
      );
    });
  }

  handleSave() {
    this.form.validateFieldsAndScroll((errors, values: TermCreationModel | TermUpdateModel) => {
      if (errors) {
        return;
      }

      this.submiting = true;
      const promisify = this.isCreating
        ? this.createTerm(values as TermCreationModel)
        : this.updateTerm(this.editModel!.id, values as TermUpdateModel);

      promisify.finally(() => {
        this.submiting = false;
      });
    });
  }

  created() {
    if (this.nested && !this.getTreeData) {
      throw new Error('Prop "getTreeData" is required when nested is true');
    }

    this.form = this.$form.createForm(this, {
      name: 'term_form',
      mapPropsToFields: () => {
        const model: Dictionary<any> = this.editModel || {
          name: '',
          slug: '',
          parentId: 0,
          description: '',
        };
        return Object.keys(model).reduce((prev, key) => {
          prev[key] = this.$form.createFormField({
            value: model[key],
          });
          return prev;
        }, {} as Dictionary<any>);
      },
      onValuesChange: (props: any, values: any) => {
        this.changed = true;
        const pureValue = Object.assign({}, this.form.getFieldsValue(), values);
        this.$emit('input', pureValue);
        this.$emit('change', pureValue);
      },
    });

    this.rules = {
      name: [
        {
          required: true,
          message: this.$tv(`${this.i18nKeyPrefix}.term_form.name_required`, 'Name is required!'),
        },
      ],
    };

    if (this.nested) {
      this.getTreeData!().then((data) => {
        // 修改时，不可修改到本身及其下级
        if (!this.isCreating) {
          const selfIndex = data.findIndex((item) => item.id === this.editModel!.id);
          if (selfIndex >= 0) {
            data.splice(selfIndex, 1);
            (function removeChildren(data: TreeData[], pId: string | number) {
              const children = data.filter((item) => item.pId === pId);
              children.forEach((child) => {
                data.splice(
                  data.findIndex((item) => item.id === child.id),
                  1,
                );
                removeChildren(data, child.id);
              });
            })(data, this.editModel!.id);
          }
        }
        this.treeData = data;
      });
    }
  }

  render() {
    return (
      <a-form
        form={this.form}
        label-col={{ xs: { span: 24 }, sm: { span: 6 } }}
        wrapper-col={{ xs: { span: 24 }, sm: { span: 18 } }}
        onSubmit={m.stop.prevent(this.handleSave.bind(this))}
      >
        <a-form-item
          label={this.$tv(`${this.i18nKeyPrefix}.term_form.name`, 'Name')}
          help={this.$tv(`${this.i18nKeyPrefix}.term_form.name_help`, 'The name is how it appears on your site.')}
        >
          <a-input
            style="width:220px"
            placeholder={this.$tv(`${this.i18nKeyPrefix}.term_form.name_placeholder`, 'Please input name')}
            {...{ directives: [{ name: 'decorator', value: ['name', { rules: this.rules.name }] }] }}
          />
        </a-form-item>

        <a-form-item
          label={this.$tv(`${this.i18nKeyPrefix}.term_form.slug`, 'Slug')}
          help={this.$tv(
            `${this.i18nKeyPrefix}.term_form.slug_help`,
            'The “slug” is the URL-friendly version of the name.',
          )}
        >
          <a-input
            style="width:220px"
            placeholder={this.$tv(`${this.i18nKeyPrefix}.term_form.slug_placeholder`, 'Please input slug')}
            {...{ directives: [{ name: 'decorator', value: ['slug'] }] }}
          />
        </a-form-item>

        {this.nested ? (
          <a-form-item
            label={this.$tv(`${this.i18nKeyPrefix}.term_form.parent`, 'Parent')}
            help={this.$tv(`${this.i18nKeyPrefix}.term_form.parent_help`, `Parent ${lowerCase(this.taxonomy)}.`)}
          >
            <a-tree-select
              style="width: 100%"
              dropdownStyle={{ maxHeight: '400px', overflow: 'auto' }}
              treeDataSimpleMode
              treeData={this.treeData}
              loadData={this.syncTreeData ? undefined : this.onLoadTreeData.bind(this)}
              placeholder={this.$tv(`${this.i18nKeyPrefix}.term_form.parent_placeholder`, 'Please choose parent')}
              {...{ directives: [{ name: 'decorator', value: ['parentId'] }] }}
            ></a-tree-select>
          </a-form-item>
        ) : null}

        <a-form-item
          label={this.$tv(`${this.i18nKeyPrefix}.term_form.description`, 'Description')}
          help={this.$tv(`${this.i18nKeyPrefix}.term_form.description_help`, 'A shot description for name.')}
        >
          <a-textarea
            placeholder={this.$tv(
              `${this.i18nKeyPrefix}.term_form.description_placeholder`,
              'Please input description',
            )}
            {...{ directives: [{ name: 'decorator', value: ['description'] }] }}
          />
        </a-form-item>

        <a-form-item wrapper-col={{ xs: { span: 24 }, sm: { span: 18, offset: 6 } }}>
          <a-button
            type="primary"
            html-type="submit"
            disabled={!this.changed}
            loading={this.submiting}
            title={
              this.btnTitle || this.isCreating
                ? this.$tv(`${this.i18nKeyPrefix}.term_form.btn_create_tips`, 'Create Term')
                : this.$tv(`${this.i18nKeyPrefix}.term_form.btn_update_tips`, 'Update Term')
            }
          >
            {this.btnText || this.isCreating
              ? this.$tv(`${this.i18nKeyPrefix}.term_form.btn_create_text`, 'Create Term')
              : this.$tv(`${this.i18nKeyPrefix}.term_form.btn_update_text`, 'Update Term')}
          </a-button>
        </a-form-item>
      </a-form>
    );
  }
}
