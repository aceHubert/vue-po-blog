import { Vue, Component } from 'nuxt-property-decorator';
import { camelCase, upperFirst } from 'lodash-es';
import { modifiers as m } from 'vue-tsx-support';
import { appStore, userStore } from '@/store/modules';
import { UserRole } from '@/includes/datas/enums';
import { gql, formatError } from '@/includes/functions';
import { UserCapability } from '@/includes/datas';
import { recomputable, recompute } from '@/utils/vue-recompute';

// Types
import { WrappedFormUtils } from 'ant-design-vue/types/form/form';
import { User, UserMetas, UserUpdateModel, UserResponse } from 'types/datas/user';
{
  /* <router>
{
  name:'users-edit',
  path:':id(\\d+)/edit',
  alias:[{
    name: 'profile-edit',
    path:'/profile/edit',
  }],
  meta:{
    title: 'Edit',
  }
}
</router> */
}

@Component({
  name: 'UserEdit',
  meta: {
    capabilities: [UserCapability.EditUsers],
  },
  head() {
    return {
      title: this.$tv('core.page-user.page_title.update', 'Update User') as string,
    };
  },
  computed: {
    displayNameOptions: recomputable(function displayNameOptions(this: UserEdit) {
      return this.getDisplayNameOptions();
    }),
  },
  asyncData: async ({ error, redirect, route, graphqlClient }) => {
    if (route.params.id === userStore.id) {
      return redirect('/profile/edit');
    }
    return graphqlClient
      .query<{ user: UserResponse }, { id: string }>({
        query: gql`
          query getUser($id: ID!) {
            user: userById(id: $id) {
              id
              username: loginName
              email
              mobile
              displayName
              url
              status
              createTime: createdAt
              metas {
                key: metaKey
                value: metaValue
              }
            }
          }
        `,
        variables: {
          id: route.params.id || userStore.id!,
        },
      })
      .then(({ data }) => {
        const { metas, ...rest } = data.user;
        return {
          editModel: Object.assign(
            {},
            rest,
            metas.reduce((prev, curr) => {
              prev[camelCase(curr.key)] = curr.value;
              return prev;
            }, {} as Dictionary<string>),
          ),
        };
      })
      .catch((err) => {
        const { statusCode, message } = formatError(err);
        error({ statusCode: statusCode, message });
      });
  },
})
export default class UserEdit extends Vue {
  // form
  form!: WrappedFormUtils;
  rules!: Dictionary<any>;

  // data
  editModel!: User & Partial<UserMetas>;
  changed!: boolean; //  对象值改变
  submiting!: boolean;

  // computed
  displayNameOptions!: string[];

  data() {
    return {
      editModel: null,
      changed: false,
      submiting: false,
    };
  }

  get isYourself() {
    return !this.$route.params.id;
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
            mutation updateUser($id: ID!, $model: UpdateUserInput!) {
              result: updateUser(id: $id, model: $model)
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
            this.$message.success(
              this.$tv('core.page-user.tips.update_successful', 'Update user info successfully!') as string,
            );
          } else {
            this.$message.error(
              this.$tv(
                'user.tips.update_failed',
                'An error occurred while updating user info, please try again later!',
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
          message: this.$tv('core.page-user.form.email_required', 'Email is required!'),
        },
        {
          type: 'email',
          message: this.$tv('core.page-user.form.email_format_error', 'Email format is incorrect!'),
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
                    : callback(
                        this.$tv('core.page-user.form.email_has_existed', `Email "${value}" has existed!`, { value }),
                      );
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
          message: this.$tv('core.page-user.form.mobile_length_error', 'Mobile format is incorrect!', { length: 11 }),
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
                    : callback(
                        this.$tv('core.page-user.form.mobile_has_existed', `Mobile "${value}" has existed!`, { value }),
                      );
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
          message: this.$tv('core.page-user.form.website_format_error', 'Website format is incorrect!'),
        },
      ],
      nickname: [
        {
          required: true,
          message: this.$tv('core.page-user.form.nickname_required', 'Nickname is required!'),
        },
      ],
      password: [
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
      <a-card class="user-edit" bordered={false}>
        <a-form
          form={this.form}
          label-col={{ xs: { span: 24 }, sm: { span: 6 } }}
          wrapper-col={{ xs: { span: 24 }, sm: { span: 18 } }}
          onSubmit={m.stop.prevent(this.handleSave.bind(this))}
        >
          {/* Name */}
          <a-form-item wrapper-col={{ xs: { span: 24 }, sm: { span: 18, offset: 6 } }} style="margin-bottom:0;">
            <h1>{this.$tv('core.page-user.form.group_name', 'Name')}</h1>
          </a-form-item>

          <a-form-item
            label={this.$tv('core.page-user.form.username', 'Username')}
            help={this.$tv('core.page-user.form.username_edit_help', 'Username can not be changed.')}
          >
            <a-input style="width:220px" disabled {...{ directives: [{ name: 'decorator', value: ['username'] }] }} />
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

          <a-form-item label={this.$tv('core.page-user.form.nickname', 'Nickname')}>
            <a-input
              style="width:220px"
              placeholder={this.$tv('core.page-user.form.nickname_placeholder', 'Please input nickname')}
              {...{ directives: [{ name: 'decorator', value: ['nickName', { rules: this.rules.nickname }] }] }}
            />
          </a-form-item>

          <a-form-item label={this.$tv('core.page-user.form.display_name', 'Display name for public as')}>
            <a-select style="width:220px" {...{ directives: [{ name: 'decorator', value: ['displayName'] }] }}>
              {this.displayNameOptions.map((name) => (
                <a-select-option value={name}>{name}</a-select-option>
              ))}
            </a-select>
          </a-form-item>

          {/* Contact Info */}
          <a-form-item wrapper-col={{ xs: { span: 24 }, sm: { span: 18, offset: 6 } }} style="margin-bottom:0;">
            <h1>{this.$tv('core.page-user.form.group_contact_info', 'Contact Info')}</h1>
          </a-form-item>

          <a-form-item
            label={this.$tv('core.page-user.form.email', 'Email')}
            has-feedback
            help={this.$tv(
              'user.form.email_edit_help',
              'If you change this, we will send you an email at your new address to confirm it. ',
            )}
          >
            <a-input
              style="width:220px"
              placeholder={this.$tv('core.page-user.form.email_placeholder', 'Please input email')}
              {...{ directives: [{ name: 'decorator', value: ['email', { rules: this.rules.email }] }] }}
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

          {/* About Yourself */}
          <a-form-item wrapper-col={{ xs: { span: 24 }, sm: { span: 18, offset: 6 } }} style="margin-bottom:0;">
            <h1>{this.$tv('core.page-user.form.group_about_yourself', 'About Yourself')}</h1>
          </a-form-item>

          <a-form-item label={this.$tv('core.page-user.form.avator', 'Profile Picture')}>
            {/* <a-upload
            action="/api/file/upload/"
            class="upload-list-inline"
            listType="picture-card"
            fileList={this.thumbnailList}
            beforeUpload={this.beforeThumbnailUpload.bind(this)}
            onChange={this.handleThumbnailChange.bind(this)}
          >
            {!this.editModel.avatar ? (
              [<a-icon type="plus" />, <div class="ant-upload-text">{this.$tv('core.page-post.btn_text.upload', 'Upload')}</div>]
            ) : (
              <v-avatar src={this.editModel.avatar} />
            )}
          </a-upload> */}
          </a-form-item>

          <a-form-item label={this.$tv('core.page-user.form.description', 'Biographical Info')}>
            <a-textarea
              style="max-width: 400px"
              placeholder={this.$tv('core.page-user.form.description_placeholder', 'A short description about you')}
              {...{ directives: [{ name: 'decorator', value: ['description'] }] }}
            ></a-textarea>
          </a-form-item>

          {/* Personal Options */}
          <a-form-item wrapper-col={{ xs: { span: 24 }, sm: { span: 18, offset: 6 } }} style="margin-bottom:0;">
            <h1>{this.$tv('core.page-user.form.group_personal_options', 'Personal Options')}</h1>
          </a-form-item>

          <a-form-item label={this.$tv('core.page-user.form.language', 'Language')}>
            <a-select style="width:120px" {...{ directives: [{ name: 'decorator', value: ['locale'] }] }}>
              <a-select-option value="">
                {this.$tv('core.page-user.form.language_site_default_option_text', 'Site Default')}
              </a-select-option>
              {this.supportLanguages.map((language) => (
                <a-select-option value={language.locale}>{language.name}</a-select-option>
              ))}
            </a-select>
          </a-form-item>

          <a-form-item label={this.$tv('core.page-user.form.admin_color', 'Admin Color Scheme')}></a-form-item>

          {/* Account Management */}
          <a-form-item wrapper-col={{ xs: { span: 24 }, sm: { span: 18, offset: 6 } }} style="margin-bottom:0;">
            <h1>{this.$tv('core.page-user.form.group_account_management', 'Account Management')}</h1>
          </a-form-item>

          {userStore.role === UserRole.Administrator ? (
            <a-form-item label={this.$tv('core.page-user.form.user_role', 'Role')}>
              <a-select style="width:160px" {...{ directives: [{ name: 'decorator', value: ['userRole'] }] }}>
                {Object.values(UserRole)
                  .reverse()
                  .map((role) => (
                    <a-select-option value={role}>{role}</a-select-option>
                  ))}
                <a-select-option value="None">
                  {this.$tv('core.page-user.form.none_user_role_option_text', 'No role for this site')}
                </a-select-option>
              </a-select>
            </a-form-item>
          ) : null}

          <a-form-item
            label={this.$tv('core.page-user.form.password', 'Password')}
            has-feedback
            help={this.$tv(
              'user.form.password_edit_help',
              'If you want to keep using old password, pleases leave it empty.',
            )}
          >
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

          <a-form-item wrapper-col={{ xs: { span: 24 }, sm: { span: 18, offset: 6 } }}>
            <a-button
              type="primary"
              html-type="submit"
              disabled={!this.changed}
              loading={this.submiting}
              title={
                this.isYourself
                  ? (this.$tv('core.page-user.btn_tips.update_profile', 'Update Profile') as string)
                  : (this.$tv('core.page-user.btn_tips.update_user', 'Update User') as string)
              }
            >
              {this.isYourself
                ? (this.$tv('core.page-user.btn_text.update_profile', 'Update Profile') as string)
                : (this.$tv('core.page-user.btn_text.update_user', 'Update User') as string)}
            </a-button>
          </a-form-item>
        </a-form>
      </a-card>
    );
  }
}
