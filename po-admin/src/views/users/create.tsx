import { Vue, Component } from 'nuxt-property-decorator';
import { modifiers as m } from 'vue-tsx-support';
import { gql, formatError } from '@/includes/functions';
import { UserRole } from '@/includes/datas/enums';
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
  head() {
    return {
      title: this.$tv('pageTitle.user.create', 'New User') as string,
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
            mutation addUser($model: NewUserInput!) {
              user: addUser(model: $model) {
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
          this.$router.replace({ name: 'users-profile', query: { id: data!.user.id } });
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
          message: this.$tv('user.form.usernameRequired', 'Username is required!'),
        },
        {
          min: 4,
          message: this.$tv('user.form.usernameMinLengthError', 'Username length must not less than 4 characters!', {
            min: 4,
          }),
        },
        {
          validator: (rule: any, value: string, callback: Function) => {
            this.verifyField('loginName', value)
              .then((result) => {
                result
                  ? callback()
                  : callback(this.$tv('user.form.usernameHasExisted', `Username "${value}" has existed!`, { value }));
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
          message: this.$tv('user.form.emailRequired', 'Email is required!'),
        },
        {
          type: 'email',
          message: this.$tv('user.form.emailFormatError', 'Email format is incorrect!'),
        },
        {
          validator: (rule: any, value: string, callback: Function) => {
            this.verifyField('email', value)
              .then((result) => {
                result
                  ? callback()
                  : callback(this.$tv('user.form.emailHasExisted', `Email "${value}" has existed!`, { value }));
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
          message: this.$tv('user.form.mobileLengthError', 'Mobile format is incorrect!', { len: 11 }),
        },
        {
          validator: (rule: any, value: string, callback: Function) => {
            this.verifyField('mobile', value)
              .then((result) => {
                result
                  ? callback()
                  : callback(this.$tv('user.form.mobileHasExisted', `Mobile "${value}" has existed!`, { value }));
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
          message: this.$tv('user.form.websiteFormatError', 'Website format is incorrect!'),
        },
      ],
      password: [
        {
          required: true,
          message: this.$tv('user.form.passwordRequired', 'Password is required!'),
        },
        {
          min: 6,
          message: this.$tv('user.form.passwordMinLengthError', 'Password length must not less than 6 characters!', {
            min: 6,
          }),
        },
      ],
    };
  }

  render() {
    return (
      <div>
        <a-form
          form={this.form}
          label-col={{ xs: { span: 24 }, sm: { span: 5 } }}
          wrapper-col={{ xs: { span: 24 }, sm: { span: 12 } }}
          onSubmit={m.stop.prevent(this.handleSave.bind(this))}
        >
          <a-form-item label={this.$tv('user.form.username', 'Username')} has-feedback>
            <a-input
              style="width:220px"
              placeholder={this.$tv('user.form.usernamePlaceholder', 'Please input username')}
              {...{
                directives: [
                  { name: 'decorator', value: ['username', { rules: this.rules.username, validateFirst: true }] },
                ],
              }}
            />
          </a-form-item>

          <a-form-item label={this.$tv('user.form.password', 'Password')} has-feedback>
            <a-input-password
              style="width:220px"
              autocomplete="off"
              placeholder={this.$tv('user.form.passwordPlaceholder', 'Please input password')}
              {...{
                directives: [
                  { name: 'decorator', value: ['password', { rules: this.rules.password, validateFirst: true }] },
                ],
              }}
            />
          </a-form-item>

          <a-form-item label={this.$tv('user.form.email', 'Email')} has-feedback>
            <a-input
              style="width:220px"
              placeholder={this.$tv('user.form.emailPlaceholder', 'Please input email')}
              {...{
                directives: [{ name: 'decorator', value: ['email', { rules: this.rules.email, validateFirst: true }] }],
              }}
            />
          </a-form-item>

          <a-form-item label={this.$tv('user.form.firstName', 'First Name')}>
            <a-input
              style="width:220px"
              placeholder={this.$tv('user.form.firstNamePlaceholder', 'Please input first name')}
              {...{ directives: [{ name: 'decorator', value: ['firstName'] }] }}
            />
          </a-form-item>

          <a-form-item label={this.$tv('user.form.lastName', 'Last Name')}>
            <a-input
              style="width:220px"
              placeholder={this.$tv('user.form.lastNamePlaceholder', 'Please input last name')}
              {...{ directives: [{ name: 'decorator', value: ['lastName'] }] }}
            />
          </a-form-item>

          <a-form-item label={this.$tv('user.form.website', 'Website')}>
            <a-input
              style="width:220px"
              placeholder={this.$tv('user.form.websitePlaceholder', 'Please input website')}
              {...{
                directives: [{ name: 'decorator', value: ['url', { rules: this.rules.website, validateFirst: true }] }],
              }}
            />
          </a-form-item>

          <a-form-item label={this.$tv('user.form.language', 'Language')}>
            <a-select style="width:120px" {...{ directives: [{ name: 'decorator', value: ['locale'] }] }}>
              <a-select-option value={null}>
                {this.$tv('user.form.languageSiteDefaultOptionText', 'Site Default')}
              </a-select-option>
              {this.supportLanguages.map((language) => (
                <a-select-option value={language.locale}>{language.name}</a-select-option>
              ))}
            </a-select>
          </a-form-item>

          <a-form-item label={this.$tv('user.form.userRole', 'Role')}>
            <a-select style="width:120px" {...{ directives: [{ name: 'decorator', value: ['userRole'] }] }}>
              {Object.values(UserRole)
                .reverse()
                .map((role) => (
                  <a-select-option value={role}>{role}</a-select-option>
                ))}
            </a-select>
          </a-form-item>

          <a-form-item label={this.$tv('user.form.sendUserNotification', 'Send User Notification')}>
            <a-checkbox {...{ directives: [{ name: 'decorator', value: ['sendUserNotification'] }] }}>
              {this.$tv(
                'user.form.sendUserNotificationCheckboxText',
                ' Send the new user an email about their account.',
              )}
            </a-checkbox>
          </a-form-item>

          <a-form-item wrapper-col={{ xs: { span: 24 }, sm: { span: 12, offset: 5 } }}>
            <a-button
              type="primary"
              html-type="submit"
              loading={this.submiting}
              title={this.$tv('user.btnTips.createUser', 'Create User')}
            >
              {this.$tv('user.btnText.createUser', 'Create User')}
            </a-button>
          </a-form-item>
        </a-form>
      </div>
    );
  }
}
