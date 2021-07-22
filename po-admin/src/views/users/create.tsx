import { Vue, Component } from 'nuxt-property-decorator';
import { modifiers as m } from 'vue-tsx-support';
import { gql, formatError } from '@/includes/functions';
import { UserRole, UserCapability } from '@/includes/datas';
import { appStore } from '@/store/modules';

// Types
import { WrappedFormUtils } from 'ant-design-vue/types/form/form';
import { User, UserCreationModel } from 'types/datas/user';

{
  /* <router>
{
  meta:{
    title: 'New',
  }
}
</router> */
}

@Component<UserCreate>({
  name: 'UserCreate',
  meta: {
    capabilities: [UserCapability.CreateUsers],
  },
  head() {
    return {
      title: this.$tv('core.page-user.page_title.creation', 'New User') as string,
    };
  },
})
export default class UserCreate extends Vue {
  // form
  form!: WrappedFormUtils;
  rules!: Dictionary<any>;

  // data
  submiting!: boolean;

  data() {
    return {
      submiting: false,
    };
  }

  get supportLanguages() {
    return appStore.supportLanguages;
  }

  verifyField(field: 'loginName' | 'email' | 'mobile', value: string) {
    const gqls = {
      loginName: gql`
        query isExists($value: String!) {
          result: isLoginNameExists(loginName: $value)
        }
      `,
      email: gql`
        query isExists($value: String!) {
          result: isEmailExists(email: $value)
        }
      `,
      mobile: gql`
        query isExists($value: String!) {
          result: isMobileExists(mobile: $value)
        }
      `,
    };
    return this.graphqlClient
      .query<{ result: boolean }, { value: string }>({
        query: gqls[field],
        variables: {
          value,
        },
      })
      .then(({ data }) => !data.result)
      .catch((err) => {
        const { message } = formatError(err);
        throw new Error(message);
      });
  }

  handleSave() {
    this.form.validateFieldsAndScroll((errors, values: UserCreationModel) => {
      if (errors) {
        return;
      }

      this.submiting = true;
      const { username, password, ...restValues } = values;
      const sha256 = require('js-sha256').sha256;
      this.graphqlClient
        .mutate<
          { user: User },
          { model: Omit<UserCreationModel, 'username' | 'password'> & { loginName: string; loginPwd: string } }
        >({
          mutation: gql`
            mutation createUser($model: NewUserInput!) {
              user: createUser(model: $model) {
                id
                loginName
              }
            }
          `,
          variables: {
            model: {
              loginName: username,
              loginPwd: sha256(password),
              ...restValues,
            },
          },
        })
        .then(({ data }) => {
          this.$router.replace({ name: 'users-edit', params: { id: data!.user.id } });
        })
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
      name: 'user_form',
      mapPropsToFields: () => {
        // 默认值
        const defaultValues: UserCreationModel = {
          username: '',
          password: '',
          email: '',
          locale: null,
          userRole: UserRole.Subscriber,
          sendUserNotification: true,
        };
        return Object.keys(defaultValues).reduce((prev, key) => {
          prev[key] = this.$form.createFormField({
            value: defaultValues[key as keyof UserCreationModel],
          });
          return prev;
        }, {} as Dictionary<any>);
      },
    });

    this.rules = {
      username: [
        {
          required: true,
          message: this.$tv('core.page-user.form.username_required', 'Username is required!'),
        },
        {
          min: 4,
          message: this.$tv(
            'core.page-user.form.username_min_length_error',
            'Username length must not less than 4 characters!',
            {
              min: 4,
            },
          ),
        },
        {
          validator: (rule: any, value: string, callback: Function) => {
            this.verifyField('loginName', value)
              .then((result) => {
                result
                  ? callback()
                  : callback(
                      this.$tv('core.page-user.form.username_has_existed', `Username "${value}" has existed!`, {
                        value,
                      }),
                    );
              })
              .catch((err) => {
                callback(err.message);
              });
          },
        },
      ],
      email: [
        {
          required: true,
          message: this.$tv('core.page-user.form.email_required', 'Email is required!'),
        },
        {
          type: 'email',
          message: this.$tv('core.page-user.form.email_format_error', 'Email format is incorrect!'),
        },
        {
          validator: (rule: any, value: string, callback: Function) => {
            this.verifyField('email', value)
              .then((result) => {
                result
                  ? callback()
                  : callback(
                      this.$tv('core.page-user.form.email_has_existed', `Email "${value}" has existed!`, { value }),
                    );
              })
              .catch((err) => {
                callback(err.message);
              });
          },
        },
      ],
      mobile: [
        {
          len: 11,
          message: this.$tv('core.page-user.form.mobile_length_error', 'Mobile format is incorrect!', { length: 11 }),
        },
        {
          validator: (rule: any, value: string, callback: Function) => {
            this.verifyField('mobile', value)
              .then((result) => {
                result
                  ? callback()
                  : callback(
                      this.$tv('core.page-user.form.mobile_has_existed', `Mobile "${value}" has existed!`, { value }),
                    );
              })
              .catch((err) => {
                callback(err.message);
              });
          },
        },
      ],
      website: [
        {
          type: 'url',
          message: this.$tv('core.page-user.form.website_format_error', 'Website format is incorrect!'),
        },
      ],
      password: [
        {
          required: true,
          message: this.$tv('core.page-user.form.password_required', 'Password is required!'),
        },
        {
          min: 6,
          message: this.$tv(
            'core.page-user.form.password_min_length_error',
            'Password length must not less than 6 characters!',
            {
              min: 6,
            },
          ),
        },
      ],
    };
  }

  render() {
    return (
      <a-card class="user-create" bordered={false}>
        <a-form
          form={this.form}
          label-col={{ xs: { span: 24 }, sm: { span: 5 } }}
          wrapper-col={{ xs: { span: 24 }, sm: { span: 12 } }}
          onSubmit={m.stop.prevent(this.handleSave.bind(this))}
        >
          <a-form-item label={this.$tv('core.page-user.form.username', 'Username')} has-feedback>
            <a-input
              style="width:220px"
              placeholder={this.$tv('core.page-user.form.username_placeholder', 'Please input username')}
              {...{
                directives: [
                  { name: 'decorator', value: ['username', { rules: this.rules.username, validateFirst: true }] },
                ],
              }}
            />
          </a-form-item>

          <a-form-item label={this.$tv('core.page-user.form.password', 'Password')} has-feedback>
            <a-input-password
              style="width:220px"
              autocomplete="off"
              placeholder={this.$tv('core.page-user.form.password_placeholder', 'Please input password')}
              {...{
                directives: [
                  { name: 'decorator', value: ['password', { rules: this.rules.password, validateFirst: true }] },
                ],
              }}
            />
          </a-form-item>

          <a-form-item label={this.$tv('core.page-user.form.email', 'Email')} has-feedback>
            <a-input
              style="width:220px"
              placeholder={this.$tv('core.page-user.form.email_placeholder', 'Please input email')}
              {...{
                directives: [{ name: 'decorator', value: ['email', { rules: this.rules.email, validateFirst: true }] }],
              }}
            />
          </a-form-item>

          <a-form-item label={this.$tv('core.page-user.form.firstname', 'First Name')}>
            <a-input
              style="width:220px"
              placeholder={this.$tv('core.page-user.form.firstname_placeholder', 'Please input first name')}
              {...{ directives: [{ name: 'decorator', value: ['firstName'] }] }}
            />
          </a-form-item>

          <a-form-item label={this.$tv('core.page-user.form.lastname', 'Last Name')}>
            <a-input
              style="width:220px"
              placeholder={this.$tv('core.page-user.form.lastname_placeholder', 'Please input last name')}
              {...{ directives: [{ name: 'decorator', value: ['lastName'] }] }}
            />
          </a-form-item>

          <a-form-item label={this.$tv('core.page-user.form.website', 'Website')}>
            <a-input
              style="width:220px"
              placeholder={this.$tv('core.page-user.form.website_placeholder', 'Please input website')}
              {...{
                directives: [{ name: 'decorator', value: ['url', { rules: this.rules.website, validateFirst: true }] }],
              }}
            />
          </a-form-item>

          <a-form-item label={this.$tv('core.page-user.form.language', 'Language')}>
            <a-select style="width:120px" {...{ directives: [{ name: 'decorator', value: ['locale'] }] }}>
              <a-select-option value={null}>
                {this.$tv('core.page-user.form.language_site_default_option_text', 'Site Default')}
              </a-select-option>
              {this.supportLanguages.map((language) => (
                <a-select-option value={language.locale}>{language.name}</a-select-option>
              ))}
            </a-select>
          </a-form-item>

          <a-form-item label={this.$tv('core.page-user.form.user_role', 'Role')}>
            <a-select style="width:120px" {...{ directives: [{ name: 'decorator', value: ['userRole'] }] }}>
              {Object.values(UserRole)
                .reverse()
                .map((role) => (
                  <a-select-option value={role}>{role}</a-select-option>
                ))}
            </a-select>
          </a-form-item>

          <a-form-item label={this.$tv('core.page-user.form.send_user_notification', 'Send User Notification')}>
            <a-checkbox
              {...{
                directives: [{ name: 'decorator', value: ['sendUserNotification', { valuePropName: 'checked' }] }],
              }}
            >
              {this.$tv(
                'core.page-user.form.send_user_notification_checkbox_text',
                'Send the new user an email about their account.',
              )}
            </a-checkbox>
          </a-form-item>

          <a-form-item wrapper-col={{ xs: { span: 24 }, sm: { span: 12, offset: 5 } }}>
            <a-button
              type="primary"
              html-type="submit"
              loading={this.submiting}
              title={this.$tv('core.page-user.btn_tips.create_user', 'Create User')}
            >
              {this.$tv('core.page-user.btn_text.create_user', 'Create User')}
            </a-button>
          </a-form-item>
        </a-form>
      </a-card>
    );
  }
}
