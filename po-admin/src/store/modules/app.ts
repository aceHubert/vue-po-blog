import { VuexModule, Module, VuexMutation, VuexAction, getModule } from 'nuxt-property-decorator';
import { store } from '@/store';
import { httpClient, graphqlClient, gql } from '@/includes/functions';
import { defaultSettings, LOCALE } from '@/configs/settings.config';
import cookie from '@/utils/cookie';

// Types
import { Context } from '@nuxt/types';
import { LangConfig } from 'types/configs/locale';
import { LayoutConfig } from 'types/configs/layout';

export type CheckResponse = {
  dbInitRequired: boolean;
};

@Module({ store, name: 'app', namespaced: true, dynamic: true, stateFactory: true })
class AppStore extends VuexModule {
  // 布局（主题色，标题，Logo等）
  layout: LayoutConfig = defaultSettings.layout;

  // 语言
  locale: string = defaultSettings.locale.default;
  supportLanguages: LangConfig[] = defaultSettings.locale.supportLanguages;

  @VuexMutation
  setAdminLayout(layout: LayoutConfig) {
    this.layout = { ...defaultSettings.layout, ...layout };
    // do something else
  }

  /**
   * 设置语言
   * @author Hubert
   * @since 2020-09-04
   * @version 0.0.1
   * 设置默认语言 locale
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
   * 添加支持语言列表
   */
  @VuexMutation
  setSupportLanguages(languages: LangConfig[]) {
    this.supportLanguages = defaultSettings.locale.supportLanguages.concat(languages);
  }

  /**
   * 检查DB是否需要初始化, false 表示不需要初始了
   */
  @VuexAction({ rawError: true })
  checkDB() {
    return httpClient.get<CheckResponse>('/db-init/check').then((model) => {
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
   * 获取自动加载的配置参数
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
   */
  @VuexAction
  goToInitPage() {
    return store.$router.replace('/init');
  }

  /**
   * 跳转到 logout 页面
   * 不在 Vue instance 的情况下，获取不到VueRouter对象
   */
  @VuexAction
  goToLogoutPage() {
    return store.$router.replace('/logout');
  }
}

export default getModule(AppStore);
