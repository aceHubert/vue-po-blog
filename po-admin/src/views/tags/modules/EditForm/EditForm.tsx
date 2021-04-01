import { Vue, Component, Prop } from 'nuxt-property-decorator';
import { modifiers as m } from 'vue-tsx-support';
import { gql, formatError } from '@/includes/functions';
import { TermTaxonomy } from '@/includes/datas/enums';
// import classes from './form.less?module';

// Types
import * as tsx from 'vue-tsx-support';
import { WrappedFormUtils } from 'ant-design-vue/types/form/form';
import { Term, TermCreationModel, TermUpdateModel } from 'types/datas';

@Component<TagEditForm>({
  name: 'TagEditForm',
})
export default class TagEditForm extends Vue {
  _tsx!: tsx.DeclareProps<tsx.PickProps<TagEditForm, 'editModel' | 'btnTitle' | 'btnText'>> &
    tsx.DeclareOnEvents<{
      onChange: (values: Dictionary<any>) => void;
      onCreated: (id: string) => void;
      onUpdated: () => void;
    }>;

  @Prop(Object) editModel?: Term;
  @Prop(String) btnTitle?: string;
  @Prop(String) btnText?: string;

  // form
  form!: WrappedFormUtils;
  rules!: Dictionary<any>;

  // data
  changed!: boolean; //  对象值改变
  submiting!: boolean;

  data() {
    return {
      changed: false,
      submiting: false,
    };
  }

  get isCreating() {
    return !this.editModel;
  }

  handleSave() {
    this.form.validateFieldsAndScroll((errors, values: TermCreationModel | TermUpdateModel) => {
      if (errors) {
        return;
      }

      this.submiting = true;
      let promisify;
      if (this.isCreating) {
        promisify = this.graphqlClient
          .mutate<{ term: Term }, { model: TermCreationModel }>({
            mutation: gql`
              mutation addTerm($model: NewTermInput!) {
                term: addTerm(model: $model) {
                  id
                }
              }
            `,
            variables: {
              model: {
                ...values,
                taxonomy: TermTaxonomy.Tag,
              } as TermCreationModel,
            },
          })
          .then(({ data }) => {
            this.$emit('created', data?.term.id);
          });
      } else {
        promisify = this.graphqlClient
          .mutate<{ result: boolean }, { id: string; model: TermUpdateModel }>({
            mutation: gql`
              mutation modifyTerm($id: ID!, $model: UpdateTermInput!) {
                result: modifyTerm(id: $id, model: $model)
              }
            `,
            variables: {
              id: this.editModel!.id,
              model: values,
            },
          })
          .then(({ data }) => {
            if (data?.result) {
              this.$emit('updated');
            }
          });
      }

      promisify
        .catch((err) => {
          const { message } = formatError(err);
          this.$message.error(message);
        })
        .finally(() => {
          this.submiting = false;
        });
    });
  }

  created() {
    this.form = this.$form.createForm(this, {
      name: 'tag_form',
      mapPropsToFields: () => {
        const model: Dictionary<any> = this.editModel || {
          name: '',
          slug: '',
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
        this.$emit('change', pureValue);
      },
    });

    this.rules = {
      name: [
        {
          required: true,
          message: this.$tv('tag.form.nameRequired', 'Name is required!'),
        },
      ],
    };
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
          label={this.$tv('tag.form.name', 'Name')}
          help={this.$tv('tag.form.nameHelp', 'The name is how it appears on your site.')}
        >
          <a-input
            style="width:220px"
            {...{ directives: [{ name: 'decorator', value: ['name', { rules: this.rules.name }] }] }}
          />
        </a-form-item>

        <a-form-item
          label={this.$tv('tag.form.slug', 'Slug')}
          help={this.$tv('tag.form.slugHelp', 'The “slug” is the URL-friendly version of the name.')}
        >
          <a-input style="width:220px" {...{ directives: [{ name: 'decorator', value: ['slug'] }] }} />
        </a-form-item>

        <a-form-item label={this.$tv('tag.form.description', 'Description')}>
          <a-textarea {...{ directives: [{ name: 'decorator', value: ['description'] }] }} />
        </a-form-item>

        <a-form-item wrapper-col={{ xs: { span: 24 }, sm: { span: 12, offset: 5 } }}>
          <a-button
            type="primary"
            html-type="submit"
            disabled={!this.changed}
            loading={this.submiting}
            title={
              this.btnTitle || this.isCreating
                ? this.$tv('tag.btnTips.createTag', 'Create Tag')
                : this.$tv('tag.btnTips.updateTag', 'Update Tag')
            }
          >
            {this.btnText || this.isCreating
              ? this.$tv('tag.btnText.createTag', 'Create Tag')
              : this.$tv('tag.btnText.updateTag', 'Update Tag')}
          </a-button>
        </a-form-item>
      </a-form>
    );
  }
}
