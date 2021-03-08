import { Vue, Component, Prop } from 'nuxt-property-decorator';
// import { modifiers as m } from 'vue-tsx-support';
// import { graphqlClient, gql } from '@/includes/functions';
import { UserStatus } from '@/includes/datas/enums';
// import classes from './EditForm.less?module';

// Types
import * as tsx from 'vue-tsx-support';
import { WrappedFormUtils } from 'ant-design-vue/types/form/form';
import { User } from 'types/datas/user';

@Component<UserEditForm>({
  name: 'UserEditForm',
})
export default class UserEditForm extends Vue {
  _tsx!: tsx.DeclareProps<tsx.PickProps<UserEditForm, 'editModel'>> &
    tsx.DeclareOnEvents<{
      onChange: (values: Dictionary<any>) => void;
      onStatusChange: (status: UserStatus) => void;
    }>;

  @Prop({ type: Object, validator: (val) => !!val.id }) editModel?: User;

  // form
  form!: WrappedFormUtils;
  rules!: Dictionary<any>;

  data() {
    return {};
  }

  get fromCreate() {
    return !this.editModel;
  }

  render() {
    return (
      <a-form form={this.form} class="px-4 py-3">
        <a-form-item label={this.$tv('post.editForm.title', 'Title')}>
          <a-input
            placeholder={this.$tv('post.editForm.titlePlaceholder', 'Please input title')}
            {...{ directives: [{ name: 'decorator', value: ['title', { rules: this.rules.title }] }] }}
          />
        </a-form-item>

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
    );
  }
}
