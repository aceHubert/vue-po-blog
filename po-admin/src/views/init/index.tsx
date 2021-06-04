import { Vue, Component, InjectReactive } from 'nuxt-property-decorator';
import { modifiers as m } from 'vue-tsx-support';
import { appStore } from '@/store/modules';
import classes from './styles/index.less?module';

// Types
import { WrappedFormUtils } from 'ant-design-vue/types/form/form';
import { Context } from '@nuxt/types';

@Component({
  name: 'Init',
  layout: 'blank',
  meta: {
    anonymous: true,
  },
  head() {
    return {
      title: this.$tv('core.page-init.page_title', 'Init Site') as string,
    };
  },
  asyncData({ redirect }: Context) {
    return appStore
      .checkDB()
      .then((required) => {
        // 已经初始化，直接跳到首页
        if (!required) {
          redirect('/');
        }
      })
      .catch((err: Error) => ({
        error: err.message,
      }));
  },
})
export default class Init extends Vue {
  @InjectReactive({ from: 'isMobile', default: false }) isMobile!: boolean;

  loading!: boolean;
  error!: string;
  form!: WrappedFormUtils;
  rules!: Dictionary<any>;

  data() {
    return {
      loading: false,
      error: '',
    };
  }

  get localeOptions() {
    return appStore.supportLanguages.map((lang) => ({
      key: lang.locale,
      value: lang.locale,
      title: lang.name,
    }));
  }

  created() {
    this.form = this.$form.createForm(this, {
      name: 'init_form',
    });
  }

  mounted() {
    // 设置默认初始值
    this.form.setFieldsValue({
      locale: appStore.locale,
      title: this.$tv('core.page-init.title_init_value', 'This is a simple title'),
      homeUrl: window.location.origin,
    });
  }

  handleSubmit() {
    this.error = '';
    this.form.validateFields({ force: true, first: true }, (err, values) => {
      if (err) {
        return;
      }
      const initParams: InitParams = { ...values };
      const sha256 = require('js-sha256').sha256;
      initParams.password = sha256(values.password);

      this.loading = true;
      appStore
        .initDB(initParams)
        .then((result) => {
          if (result) {
            this.$router.replace({ path: '/login' });
          }
        })
        .catch((err) => {
          if (this.isMobile) {
            this.$message.error(err.message);
          } else {
            this.error = err.message;
          }
        })
        .finally(() => {
          this.loading = false;
        });
    });
  }

  render() {
    return (
      <div id="init" class={classes.wrapper}>
        <div class={classes.container}>
          <div class={classes.top}>
            <p class={classes.topTitle}>{this.$tv('core.page-init.title', 'Start to use Plumemo Blog')}</p>
          </div>
          <a-form class={classes.form} form={this.form} onSubmit={m.stop.prevent(this.handleSubmit.bind(this))}>
            <a-form-item
              class={classes.formItem}
              extra={this.$tv('core.page-init.locale_description', 'Language for admin account')}
            >
              <a-select
                options={this.localeOptions}
                size="large"
                placeholder={this.$tv('core.page-init.locale_placeholder', 'Admin language')}
                {...{
                  directives: [
                    {
                      name: 'decorator',
                      value: [
                        'locale',
                        {
                          rules: [
                            {
                              required: true,
                              message: this.$tv('core.page-init.locale_required', 'Admin language is required'),
                            },
                          ],
                          validateTrigger: 'change',
                        },
                      ],
                    },
                  ],
                }}
              ></a-select>
            </a-form-item>
            <a-form-item class={classes.formItem} extra={this.$tv('core.page-init.title_description', 'Blog title')}>
              <a-input
                size="large"
                type="text"
                placeholder={this.$tv('core.page-init.title_placeholder', 'Blog title')}
                {...{
                  directives: [
                    {
                      name: 'decorator',
                      value: [
                        'title',
                        {
                          rules: [
                            {
                              required: true,
                              message: this.$tv('core.page-init.title_required', 'Blog title is required'),
                            },
                          ],
                          validateTrigger: 'blur',
                        },
                      ],
                    },
                  ],
                }}
              ></a-input>
            </a-form-item>
            <a-form-item
              class={classes.formItem}
              extra={this.$tv(
                'core.page-init.home_url_description',
                'If you set the different domain address with admin, use which you set',
              )}
            >
              <a-input
                size="large"
                type="text"
                placeholder={this.$tv('core.page-init.home_url_placeholder', 'Blog domain address')}
                {...{
                  directives: [
                    {
                      name: 'decorator',
                      value: [
                        'homeUrl',
                        {
                          rules: [
                            {
                              required: true,
                              message: this.$tv('core.page-init.home_url_required', 'Home URL is required!'),
                            },
                            {
                              type: 'url',
                              message: this.$tv(
                                'core.page-init.home_url_format_validation',
                                'Home Url format is not correct',
                              ),
                            },
                          ],
                          validateTrigger: 'blur',
                        },
                      ],
                    },
                  ],
                }}
              ></a-input>
            </a-form-item>
            <a-form-item
              class={classes.formItem}
              extra={this.$tv('core.page-init.password_description', 'Password for admin account')}
            >
              <a-input
                size="large"
                type="text"
                maxLength={50}
                placeholder={this.$tv('core.page-init.password_placeholder', 'Password')}
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
                              message: this.$tv('core.page-init.password_required', 'Password is required!'),
                            },
                            {
                              min: 6,
                              message: this.$tv(
                                'core.page-init.password_length_vaildation',
                                'Password length must be at least 6 characters!',
                                { length: 6 },
                              ),
                            },
                          ],
                          validateTrigger: 'blur',
                        },
                      ],
                    },
                  ],
                }}
              ></a-input>
            </a-form-item>
            <a-form-item
              class={classes.formItem}
              extra={this.$tv('core.page-init.email_description', 'Email for admin account')}
            >
              <a-input
                size="large"
                type="text"
                placeholder={this.$tv('core.page-init.email_placeholder', 'Email')}
                {...{
                  directives: [
                    {
                      name: 'decorator',
                      value: [
                        'email',
                        {
                          rules: [
                            {
                              required: true,
                              message: this.$tv('core.page-init.email_required', 'Email is required!'),
                            },
                            {
                              type: 'email',
                              message: this.$tv(
                                'core.page-init.email_format_validation',
                                'Email format is not correct!',
                              ),
                            },
                          ],
                          validateTrigger: 'blur',
                        },
                      ],
                    },
                  ],
                }}
              ></a-input>
            </a-form-item>

            {this.error ? <a-alert type="error" showIcon message={this.error} /> : null}

            <a-form-item style="margin-top: 24px">
              <a-button
                block
                size="large"
                type="primary"
                htmlType="submit"
                loading={this.loading}
                disabled={this.loading}
              >
                {this.$tv('core.page-init.btn_start_text', 'Start')}
              </a-button>
            </a-form-item>
          </a-form>
        </div>
      </div>
    );
  }
}
