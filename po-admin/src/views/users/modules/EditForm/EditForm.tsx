import { Vue, Component, Prop } from 'nuxt-property-decorator';
import { upperFirst } from 'lodash-es';
import { modifiers as m } from 'vue-tsx-support';
import { gql, formatError } from '@/includes/functions';
import { UserRole } from '@/includes/datas/enums';
import { appStore, userStore } from '@/store/modules';
import { recomputable, recompute } from '@/utils/vue-recompute';
// import classes from './form.less?module';

// Types
import * as tsx from 'vue-tsx-support';
import { WrappedFormUtils } from 'ant-design-vue/types/form/form';
import { User, UserMetas, UserUpdateModel } from 'types/datas/user';

@Component<UserEditForm>({
  name: 'UserEditForm',
  computed: {
    displayNameOptions: recomputable(function displayNameOptions(this: UserEditForm) {
      return this.getDisplayNameOptions();
    }),
  },
})
export default class UserEditForm extends Vue {
  _tsx!: tsx.DeclareProps<tsx.PickProps<UserEditForm, 'editModel' | 'btnTitle' | 'btnText'>> &
    tsx.DeclareOnEvents<{
      onChange: (values: Dictionary<any>) => void;
    }>;

  @Prop({ type: Object, required: true, validator: (val) => !!val.id }) editModel!: User & Partial<UserMetas>;
  @Prop(String) btnTitle?: string;
  @Prop(String) btnText?: string;

  // form
  form!: WrappedFormUtils;
  rules!: Dictionary<any>;

  // data
  changed!: boolean; //  对象值改变
  submiting!: boolean;

  // computed
  displayNameOptions!: string[];

  data() {
    return {
      changed: false,
      submiting: false,
    };
  }

  get supportLanguages() {
    return appStore.supportLanguages;
  }

  getDisplayNameOptions() {
    const names = new Set<string>();
    names.add(this.editModel.username); // 登录用户名
    names.add(this.editModel.displayName); // 历史显示名
    names.add(this.editModel.nickName!); // 历史别名
    // 历史姓和名
    let nameArr = [this.editModel.firstName, this.editModel.lastName].filter(Boolean);
    if (nameArr.length > 0) {
      names.add(nameArr.join(' '));
      if (nameArr.length > 1) {
        names.add(nameArr.reverse().join(' '));
      }
    }
    names.add(this.form.getFieldValue('nickName')); // 输入别名
    // 输入姓和名
    nameArr = [this.form.getFieldValue('firstName'), this.form.getFieldValue('lastName')].filter(Boolean);
    if (nameArr.length > 0) {
      names.add(nameArr.join(' '));
      if (nameArr.length > 1) {
        names.add(nameArr.reverse().join(' '));
      }
    }
    return [...names];
  }

  verifyField(field: 'email' | 'mobile', value: string) {
    const gqls = {
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
      .then(({ data }) => !data.result);
  }

  handleSave() {
    this.form.validateFieldsAndScroll((errors, values: UserUpdateModel & { username: string }) => {
      if (errors) {
        return;
      }

      this.submiting = true;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { username, password, ...restValues } = values;
      const sha256 = require('js-sha256').sha256;

      this.graphqlClient
        .mutate<{ result: boolean }, { id: string; model: Omit<UserUpdateModel, 'password'> & { loginPwd: string } }>({
          mutation: gql`
            mutation modifyUser($id: ID!, $model: UpdateUserInput!) {
              result: modifyUser(id: $id, model: $model)
            }
          `,
          variables: {
            id: this.editModel.id,
            model: {
              loginPwd: password && sha256(password),
              ...restValues,
            },
          },
        })
        .then(({ data }) => {
          if (data?.result) {
            this.changed = false;
            this.$message.success(this.$tv('user.tips.updateSuccess', 'Update user info successfully!') as string);
          } else {
            this.$message.error(
              this.$tv(
                'user.tips.updateFailed',
                'An error occurred during updating user info, please try later again!',
              ) as string,
            );
          }
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
        return Object.keys(this.editModel).reduce((prev, key) => {
          prev[key] = this.$form.createFormField({
            value:
              key === 'userRole'
                ? this.editModel![key]
                  ? upperFirst(this.editModel![key])
                  : 'None'
                : this.editModel![key],
          });
          return prev;
        }, {} as Dictionary<any>);
      },
      onValuesChange: (props: any, values: any) => {
        this.changed = true;
        // 重新计算 displayName 选项
        if (Object.keys(values).some((fieldName) => ['firstName', 'lastName', 'nickName'].includes(fieldName))) {
          recompute(this, 'displayNameOptions');
        }
        const pureValue = Object.assign({}, this.form.getFieldsValue(), values);
        this.$emit('change', pureValue);
      },
    });

    this.rules = {
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
            if (value === this.editModel.email) {
              // 如果相同，同不检测
              callback();
            } else {
              this.verifyField('email', value)
                .then((result) => {
                  result
                    ? callback()
                    : callback(this.$tv('user.form.emailHasExisted', `Email "${value}" has existed!`, { value }));
                })
                .catch((err) => {
                  callback(err.message);
                });
            }
          },
        },
      ],
      mobile: [
        {
          len: 11,
          message: this.$tv('user.form.mobileLengthError', 'Mobile format is incorrect!'),
          whitespace: true,
        },
        {
          validator: (rule: any, value: string, callback: Function) => {
            if (value === this.editModel.mobile) {
              // 如果相同，同不检测
              callback();
            } else {
              this.verifyField('mobile', value)
                .then((result) => {
                  result
                    ? callback()
                    : callback(this.$tv('user.form.mobileHasExisted', `Mobile "${value}" has existed!`, { value }));
                })
                .catch((err) => {
                  callback(err.message);
                });
            }
          },
        },
      ],
      website: [
        {
          type: 'url',
          message: this.$tv('user.form.websiteFormatError', 'Website format is incorrect!'),
        },
      ],
      nickname: [
        {
          required: true,
          message: this.$tv('user.form.nicknameRequired', 'Nickname is required!'),
        },
      ],
      password: [
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
      <a-form
        form={this.form}
        label-col={{ xs: { span: 24 }, sm: { span: 6 } }}
        wrapper-col={{ xs: { span: 24 }, sm: { span: 18 } }}
        onSubmit={m.stop.prevent(this.handleSave.bind(this))}
      >
        {/* Name */}
        <a-form-item wrapper-col={{ xs: { span: 24 }, sm: { span: 18, offset: 6 } }} style="margin-bottom:0;">
          <h1>{this.$tv('user.form.groupName', 'Name')}</h1>
        </a-form-item>

        <a-form-item
          label={this.$tv('user.form.username', 'Username')}
          help={this.$tv('user.form.usernameEditHelp', 'Username can not be changed.')}
        >
          <a-input style="width:220px" disabled {...{ directives: [{ name: 'decorator', value: ['username'] }] }} />
        </a-form-item>

        <a-form-item label={this.$tv('user.form.firstName', 'First Name')}>
          <a-input
            style="width:220px"
            placeholder={this.$tv('user.form.emailPlaceholder', 'Please input first name')}
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

        <a-form-item label={this.$tv('user.form.nickname', 'Nickname')}>
          <a-input
            style="width:220px"
            placeholder={this.$tv('user.form.nicknamePlaceholder', 'Please input nickname')}
            {...{ directives: [{ name: 'decorator', value: ['nickName', { rules: this.rules.nickname }] }] }}
          />
        </a-form-item>

        <a-form-item label={this.$tv('user.form.displayName', 'Display name for public as')}>
          <a-select style="width:220px" {...{ directives: [{ name: 'decorator', value: ['displayName'] }] }}>
            {this.displayNameOptions.map((name) => (
              <a-select-option value={name}>{name}</a-select-option>
            ))}
          </a-select>
        </a-form-item>

        {/* Contact Info */}
        <a-form-item wrapper-col={{ xs: { span: 24 }, sm: { span: 18, offset: 6 } }} style="margin-bottom:0;">
          <h1>{this.$tv('user.form.groupContactInfo', 'Contact Info')}</h1>
        </a-form-item>

        <a-form-item
          label={this.$tv('user.form.email', 'Email')}
          has-feedback
          help={this.$tv(
            'user.form.emailEditHelp',
            'If you change this, we will send you an email at your new address to confirm it. ',
          )}
        >
          <a-input
            style="width:220px"
            placeholder={this.$tv('user.form.emailPlaceholder', 'Please input email')}
            {...{ directives: [{ name: 'decorator', value: ['email', { rules: this.rules.email }] }] }}
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

        {/* About Yourself */}
        <a-form-item wrapper-col={{ xs: { span: 24 }, sm: { span: 18, offset: 6 } }} style="margin-bottom:0;">
          <h1>{this.$tv('user.form.groupAboutYourself', 'About Yourself')}</h1>
        </a-form-item>

        <a-form-item label={this.$tv('user.form.description', 'Biographical Info')}>
          <a-textarea
            style="max-width: 400px"
            placeholder={this.$tv('user.form.descriptionPlaceholder', 'A short description about you')}
            {...{ directives: [{ name: 'decorator', value: ['description'] }] }}
          ></a-textarea>
        </a-form-item>

        <a-form-item label={this.$tv('user.form.avator', 'Profile Picture')}></a-form-item>

        {/* Personal Options */}
        <a-form-item wrapper-col={{ xs: { span: 24 }, sm: { span: 18, offset: 6 } }} style="margin-bottom:0;">
          <h1>{this.$tv('user.form.groupPersonalOptions', 'Personal Options')}</h1>
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

        <a-form-item label={this.$tv('user.form.adminColor', 'Admin Color Scheme')}></a-form-item>

        {/* Account Management */}
        <a-form-item wrapper-col={{ xs: { span: 24 }, sm: { span: 18, offset: 6 } }} style="margin-bottom:0;">
          <h1>{this.$tv('user.form.groupAccountManagement', 'Account Management')}</h1>
        </a-form-item>

        {userStore.role === UserRole.Administrator ? (
          <a-form-item label={this.$tv('user.form.userRole', 'Role')}>
            <a-select style="width:160px" {...{ directives: [{ name: 'decorator', value: ['userRole'] }] }}>
              {Object.values(UserRole)
                .reverse()
                .map((role) => (
                  <a-select-option value={role}>{role}</a-select-option>
                ))}
              <a-select-option value="None">
                {this.$tv('user.form.noneUserRoleOption', 'No role for this site')}
              </a-select-option>
            </a-select>
          </a-form-item>
        ) : null}

        <a-form-item
          label={this.$tv('user.form.password', 'Password')}
          has-feedback
          help={this.$tv(
            'user.form.passwordEditHelp',
            'if you want to keep using old password, pleases leave it empty.',
          )}
        >
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

        <a-form-item wrapper-col={{ xs: { span: 24 }, sm: { span: 18, offset: 6 } }}>
          <a-button
            type="primary"
            html-type="submit"
            disabled={!this.changed}
            loading={this.submiting}
            title={this.btnTitle || this.$tv('user.btnTips.updateUser', 'Update User')}
          >
            {this.btnText || this.$tv('user.btnText.updateUser', 'Update User')}
          </a-button>
        </a-form-item>
      </a-form>
    );
  }
}
