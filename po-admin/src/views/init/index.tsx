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
      title: this.$tv('init.titleInitValue', 'This is a simple title'),
      siteUrl: window.location.origin,
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
            this.$router.replace({ path: '/logout' });
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
            <p class={classes.topTitle}>{this.$tv('init.title', 'Start to use Polumemo Blog')}</p>
          </div>
          <a-form class={classes.form} form={this.form} onSubmit={m.stop.prevent(this.handleSubmit.bind(this))}>
            <a-form-item help={this.$tv('init.localeDescription', 'Locale description')}>
              <a-select
                options={this.localeOptions}
                size="large"
                placeholder={this.$tv('init.localePlaceholder', 'Locale')}
                {...{
                  directives: [
                    {
                      name: 'decorator',
                      value: [
                        'locale',
                        {
                          rules: [{ required: true, message: this.$tv('init.localeRequired', 'Locale is required') }],
                          validateTrigger: 'change',
                        },
                      ],
                    },
                  ],
                }}
              ></a-select>
            </a-form-item>
            <a-form-item help={this.$tv('init.titleDescription', 'Title description')}>
              <a-input
                size="large"
                type="text"
                placeholder={this.$tv('init.titlePlaceholder', 'Title')}
                {...{
                  directives: [
                    {
                      name: 'decorator',
                      value: [
                        'title',
                        {
                          rules: [{ required: true, message: this.$tv('init.titleRequired', 'Title is required') }],
                          validateTrigger: 'blur',
                        },
                      ],
                    },
                  ],
                }}
              ></a-input>
            </a-form-item>
            <a-form-item help={this.$tv('init.siteUrlDescription', 'Site URL description')}>
              <a-input
                size="large"
                type="text"
                placeholder={this.$tv('init.siteUrlPlaceholder', 'Site URL')}
                {...{
                  directives: [
                    {
                      name: 'decorator',
                      value: [
                        'siteUrl',
                        {
                          rules: [
                            { required: true, message: this.$tv('init.siteUrlRequired', 'Site URL is required!') },
                            {
                              type: 'url',
                              message: this.$tv('init.siteUrlFormValidation', 'Site Url format is not correct'),
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
            <a-form-item help={this.$tv('init.passwordDescription', 'Password description')}>
              <a-input
                size="large"
                type="text"
                maxLength={50}
                placeholder={this.$tv('init.passwordPlaceholder', 'Password')}
                {...{
                  directives: [
                    {
                      name: 'decorator',
                      value: [
                        'password',
                        {
                          rules: [
                            { required: true, message: this.$tv('init.passwordRequired', 'Password is required!') },
                            {
                              min: 6,
                              message: this.$tv(
                                'init.passwordLengthVaildation',
                                'Password length must be at least 6 bits!',
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
            <a-form-item help={this.$tv('init.emailDescription', 'Email description')}>
              <a-input
                size="large"
                type="text"
                placeholder={this.$tv('init.emailPlaceholder', 'Email')}
                {...{
                  directives: [
                    {
                      name: 'decorator',
                      value: [
                        'email',
                        {
                          rules: [
                            { required: true, message: this.$tv('init.emailRequired', 'Email is required!') },
                            {
                              type: 'email',
                              message: this.$tv('init.emailFormatValidation', 'Email format is not correct'),
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
                {this.$tv('init.btnInit', 'Start')}
              </a-button>
            </a-form-item>
          </a-form>
        </div>
      </div>
    );
  }
}
