import { Vue, Component, InjectReactive } from 'nuxt-property-decorator';
import { modifiers as m } from 'vue-tsx-support';
import userStore from '@/store/modules/user';
import { isAbsoluteUrl } from '@/utils/path';
import classes from './styles/login.less?module';

// Types
import { WrappedFormUtils } from 'ant-design-vue/types/form/form';
import { LoginQuery } from '@/store/modules/user';

{
  /* <router>
{
  path: '/login'
}
</router> */
}

@Component({
  name: 'Login',
  layout: 'user',
})
export default class Login extends Vue {
  @InjectReactive({ from: 'isMobile', default: false }) isMobile!: boolean;

  logining!: boolean;
  loginError!: string;
  form!: WrappedFormUtils;
  rules!: Dictionary<any>;

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
        .login(loginParams)
        .then(() => {
          const returnUrl = this.$route.query && (this.$route.query.returnUrl as string | null);
          if (returnUrl && isAbsoluteUrl(returnUrl)) {
            window.location.href = returnUrl;
          } else {
            this.$router.push({ path: returnUrl || '/' });
          }
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
      <div id="login" class={classes.wrapper}>
        <div class={classes.top}>
          <p class={classes.topTitle}>{this.$tv('login.title', 'Welcome to Polumemo Blog Admin')}</p>
          <p class={classes.topDesc}>{this.$tv('login.description', 'A simple front-end to back-end blog system')}</p>
        </div>
        <a-form class={classes.form} form={this.form} onSubmit={m.stop.prevent(this.handleSubmit.bind(this))}>
          <a-form-item>
            <a-input
              size="large"
              type="text"
              placeholder={this.$tv('login.usernamePlaceholder', 'Username/Email')}
              {...{
                directives: [
                  {
                    name: 'decorator',
                    value: [
                      'username',
                      {
                        rules: [
                          { required: true, message: this.$tv('login.usernameRequired', 'Username is required') },
                        ],
                        validateTrigger: 'change',
                      },
                    ],
                  },
                ],
              }}
            >
              <a-icon slot="prefix" type="user" style={{ color: 'rgba(0,0,0,.25)' }} />
            </a-input>
          </a-form-item>

          <a-form-item>
            <a-input
              size="large"
              type="password"
              autocomplete="false"
              placeholder={this.$tv('login.passwordPlaceholder', 'Password')}
              {...{
                directives: [
                  {
                    name: 'decorator',
                    value: [
                      'password',
                      {
                        rules: [
                          { required: true, message: this.$tv('login.passwordRequired', 'Password is required!') },
                        ],
                        validateTrigger: 'change',
                      },
                    ],
                  },
                ],
              }}
            >
              <a-icon slot="prefix" type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />
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
              {this.$tv('login.btnLogin', 'Log In')}
            </a-button>
          </a-form-item>
        </a-form>
      </div>
    );
  }
}
