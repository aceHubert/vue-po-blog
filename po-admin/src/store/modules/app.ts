import { VuexModule, Module, VuexMutation, VuexAction, getModule } from 'nuxt-property-decorator';
import { store } from '@/store';
import { httpClient, graphqlClient, gql } from '@/includes/functions';
import { defaultSettings, LOCALE } from '@/configs/settings.config';
import cookie from '@/utils/cookie';

// Types
import { Context } from '@nuxt/types';
import { LocaleMessages } from 'vue-i18n';
import { LocaleConfig } from 'types/configs/locale';
import { LayoutConfig, ColorConfig } from 'types/configs/layout';

@Module({ store, name: 'app', namespaced: true, dynamic: true, stateFactory: true })
class AppStore extends VuexModule {
  // 布局（标题，Logo等）
  layout: LayoutConfig = defaultSettings.layout;
  // 主题（主题色，dark/light 模式等）
  color: ColorConfig = defaultSettings.color;
  // 语言
  locale = 'en-US';
  supportLanguages: LocaleConfig[] = [];

  /**
   * 设置布局
   * @author Hubert
   * @since 2020-09-04
   * @version 0.0.1
   * @param layout 布局配置
   */
  @VuexMutation
  setLayout(layout: LayoutConfig) {
    this.layout = { ...defaultSettings.layout, ...layout };
    // do something else
  }

  /**
   * 设置主题颜色
   * @author Hubert
   * @since 2020-09-04
   * @version 0.0.1
   * @param color 主题颜色配置
   */
  @VuexMutation
  setColor(color: ColorConfig) {
    this.color = { ...defaultSettings.color, ...color };
    // do something else
  }

  /**
   * 设置语言
   * @author Hubert
   * @since 2020-09-04
   * @version 0.0.1
   */
  @VuexMutation
  setLocale(locale: string) {
    const { locale: newLocale } =
      this.supportLanguages.find((lang) => lang.locale === locale || lang.alternate === locale) || {};
    if (newLocale && newLocale !== this.locale) {
      this.locale = newLocale;
      store.app.i18n && ((store.app.i18n as any).locale = newLocale);
      const { req, res } = store.app.context as Context;
      const Cookie = process.client ? cookie.clientCookie : cookie.serverCookie(req, res);
      Cookie.set(LOCALE, newLocale, {
        path: '/',
        httpOnly: false,
      });
    }
  }

  /**
   * 设置支持的语言
   * @author Hubert
   * @since 2020-09-04
   * @version 0.0.1
   */
  @VuexMutation
  setSupportLanguages(languages: LocaleConfig[]) {
    this.supportLanguages = languages;
  }

  /**
   * 检查DB是否需要初始化, false 表示不需要初始了
   * @author Hubert
   * @since 2020-09-04
   * @version 0.0.1
   */
  @VuexAction({ rawError: true })
  checkDB() {
    return httpClient.get<{ dbInitRequired: boolean }>('/db-init/check').then((model) => {
      if (model.success) {
        return model.dbInitRequired;
      } else {
        // 不会返回 false
        return false;
      }
    });
  }

  /**
   * 初始化数据库
   * 如果数据库已经初始化，则会返回false。可以通过checkDB 判断
   * @author Hubert
   * @since 2020-09-04
   * @version 0.0.1
   * @param params 初始化参数
   */
  @VuexAction({ rawError: true })
  initDB(params: InitParams) {
    return httpClient.post('/db-init/start', params).then((model) => {
      if (model.success) {
        return true;
      } else {
        throw new Error(model.message);
      }
    });
  }

  /**
   * 获取翻译配置
   * @author Hubert
   * @since 2020-09-04
   * @version 0.0.1
   * @param locale Locale code, 如果不传值，将会获取所有语言配置ƒ
   */
  getTranslations(): Promise<{ languages: string[]; translations: LocaleMessages }>;
  getTranslations(locale: string): Promise<LocaleMessages>;
  @VuexAction({ rawError: true })
  getTranslations(locale?: string): Promise<LocaleMessages | { languages: string[]; translations: LocaleMessages }> {
    return httpClient
      .get<{ locale: LocaleMessages | { languages: string[]; translations: LocaleMessages } }>(
        '/locale/admin/translations',
        { params: { locale } },
      )
      .then((model) => {
        if (model.success) {
          return model.locale;
        } else {
          throw new Error(model.message);
        }
      });
  }

  /**
   * 获取自动加载的配置参数
   * @author Hubert
   * @since 2020-09-04
   * @version 0.0.1
   */
  @VuexAction({ rawError: true })
  getAutoLoadOptions() {
    return graphqlClient
      .query<{ options: Array<{ name: string; value: string }> }>({
        query: gql`
          query getAutoloadOptions {
            options(autoload: Yes) {
              name: optionName
              value: optionValue
            }
          }
        `,
      })
      .then(({ data }) => {
        return data.options.reduce((prev, curr) => {
          prev[curr.name] = curr.value;
          return prev;
        }, {} as Dictionary<string>);
      });
  }

  /**
   * 跳转到 init 页面
   * 不在 Vue instance 的情况下，获取不到VueRouter对象
   * @author Hubert
   * @since 2020-09-04
   * @version 0.0.1
   */
  @VuexAction
  initPage() {
    if (!store.$router.currentRoute.path.startsWith('/init')) {
      return store.$router.replace('/init');
    }
    return Promise.resolve();
  }

  /**
   * 登出
   * 不在 Vue instance 的情况下，获取不到VueRouter对象
   * @author Hubert
   * @since 2020-09-04
   * @version 0.0.1
   */
  @VuexAction
  signout() {
    // 以免多次调用跳转循环
    if (!store.$router.currentRoute.path.startsWith('/signout')) {
      return store.$router.replace('/signout');
    }
    return Promise.resolve();
  }
}

export default getModule(AppStore);
