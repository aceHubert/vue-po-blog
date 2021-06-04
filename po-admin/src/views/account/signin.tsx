import { Vue, Component, InjectReactive } from 'nuxt-property-decorator';
import { modifiers as m } from 'vue-tsx-support';
import { appStore, userStore } from '@/store/modules';
import { isAbsoluteUrl } from '@/utils/path';
import classes from './styles/signin.less?module';

// Types
import { WrappedFormUtils } from 'ant-design-vue/types/form/form';
import { LoginQuery } from '@/store/modules/user';

{
  /* <router>
{
  path: '/signin',
  meta:{
    title: 'Signin',
  }
}
</router> */
}

@Component({
  name: 'SignIn',
  layout: 'user',
  meta: {
    anonymous: true,
  },
  head() {
    return {
      title: this.$tv('core.page-signin.page_title', 'Sign In') as string,
    };
  },
})
export default class SignIn extends Vue {
  @InjectReactive({ from: 'isMobile', default: false }) isMobile!: boolean;

  // form
  form!: WrappedFormUtils;
  rules!: Dictionary<any>;

  // data
  logining!: boolean;
  loginError!: string;
  data() {
    return {
      logining: false,
      loginError: '',
    };
  }

  created() {
    this.form = this.$form.createForm(this, {
      name: 'login_form',
    });
  }

  // validateUsername(rule: any, value: any, callback: Function) {
  //   if (value && !/^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/.test(value)) {
  //     callback('邮箱地址格式不正确');
  //   } else {
  //     callback();
  //   }
  // }

  handleSubmit() {
    this.loginError = '';
    this.form.validateFields({ force: true, first: true }, (err, values) => {
      if (err) {
        return;
      }
      const loginParams: LoginQuery = { ...values };
      const sha256 = require('js-sha256').sha256;
      loginParams.password = sha256(values.password);

      this.logining = true;
      userStore
        .signin(loginParams)
        .then(() => {
          // 登录后要重新设置站点的个人配置
          return userStore
            .getUserInfo()
            .then(() => {
              let siteLocale = this.$userOptions.locale;
              if (userStore.info.locale) {
                siteLocale = userStore.info.locale;
              }

              appStore.setLocale(siteLocale);

              // 跳转
              const returnUrl = this.$route.query && (this.$route.query.returnUrl as string | null);
              if (returnUrl && isAbsoluteUrl(returnUrl)) {
                window.location.href = returnUrl;
              } else {
                this.$router.push({ path: returnUrl || '/' });
              }
            })
            .catch(() => {
              // ate by dog
            });
        })
        .catch((err) => {
          if (this.isMobile) {
            this.$message.error(err.message);
          } else {
            this.loginError = err.message;
          }
        })
        .finally(() => {
          this.logining = false;
        });
    });
  }

  render() {
    return (
      <div id="signin" class={classes.wrapper}>
        <div class={classes.top}>
          <p class={classes.topTitle}>{this.$tv('core.page-signin.title', 'Welcome to Plumemo Blog Admin')}</p>
          <p class={classes.topSubtitle}>
            {this.$tv('core.page-signin.subtitle', 'A simple front-end to back-end blog system')}
          </p>
        </div>
        <a-form class={classes.form} form={this.form} onSubmit={m.stop.prevent(this.handleSubmit.bind(this))}>
          <a-form-item>
            <a-input
              size="large"
              type="text"
              placeholder={this.$tv('core.page-signin.username_placeholder', 'Username/Email')}
              {...{
                directives: [
                  {
                    name: 'decorator',
                    value: [
                      'username',
                      {
                        rules: [
                          {
                            required: true,
                            message: this.$tv('core.page-signin.username_required', 'Username is required!'),
                          },
                        ],
                        validateTrigger: 'change',
                      },
                    ],
                  },
                ],
              }}
            >
              <a-icon slot="prefix" type="user" />
            </a-input>
          </a-form-item>

          <a-form-item>
            <a-input
              size="large"
              type="password"
              autocomplete="false"
              placeholder={this.$tv('core.page-signin.password_placeholder', 'Password')}
              {...{
                directives: [
                  {
                    name: 'decorator',
                    value: [
                      'password',
                      {
                        rules: [
                          {
                            required: true,
                            message: this.$tv('core.page-signin.password_required', 'Password is required!'),
                          },
                        ],
                        validateTrigger: 'change',
                      },
                    ],
                  },
                ],
              }}
            >
              <a-icon slot="prefix" type="lock" />
            </a-input>
          </a-form-item>

          {this.loginError ? <a-alert type="error" showIcon message={this.loginError} /> : null}

          <a-form-item style="margin-top: 24px">
            <a-button
              block
              size="large"
              type="primary"
              htmlType="submit"
              loading={this.logining}
              disabled={this.logining}
            >
              {this.$tv('core.page-signin.btn_signin_text', 'Sign In')}
            </a-button>
          </a-form-item>
        </a-form>
      </div>
    );
  }
}
