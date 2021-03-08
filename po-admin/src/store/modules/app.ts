import Vue from 'vue';
import { VuexModule, Module, VuexMutation, VuexAction, getModule } from 'nuxt-property-decorator';
import { store } from '@/store';
import { httpClient, graphqlClient, gql } from '@/includes/functions';
import cookie from '@/utils/cookie';
import config, {
  SET_LAYOUT,
  SET_THEME,
  SET_PRIMARY_COLOR,
  SET_CONTENT_WIDTH,
  TOGGLE_SIDE_COLLAPSED,
  TOGGLE_FIXED_HEADER,
  TOGGLE_FIX_SIDEBAR,
  TOGGLE_AUTO_HIDE_HEADER,
  TOGGLE_COLOR_WEAK,
  TOGGLE_MULTI_TAB,
  Layout,
  Theme,
  ContentWidth,
  LOCALE,
} from '@/config/proLayoutConfigs';

// Types
import { Context } from '@nuxt/types';
import { LangConfig } from 'types/locale';

export type CheckResponse = {
  initRequired: boolean;
};

@Module({ store, name: 'app', namespaced: true, dynamic: true, stateFactory: true })
class AppStore extends VuexModule {
  layout: Layout = config.settings.layout;
  theme: Theme = config.settings.theme;
  primaryColor = config.settings.primaryColor;
  contentWidth: ContentWidth = config.settings.contentWidth;
  fixedHeader = config.settings.fixedHeader;
  fixSidebar = config.settings.fixSiderbar;
  sideCollapsed = config.settings.sideCollapsed;
  colorWeak = config.settings.colorWeak;
  // 下面两个暂时没有用
  autoHideHeader = config.settings.autoHideHeader;
  multiTab: boolean = config.settings.multiTab;

  // 语言
  locale: string = config.locale.default;
  supportLanguages: LangConfig[] = config.locale.supportLanguages;

  get isDark() {
    return this.theme === Theme.Dark;
  }

  get isLight() {
    return !this.isDark;
  }

  @VuexMutation
  setLayout(mode: Layout) {
    this.layout = mode;
    Vue.ls.set(SET_LAYOUT, mode);
  }

  @VuexMutation
  setTheme(theme: Theme) {
    this.theme = theme;
    Vue.ls.set(SET_THEME, theme);
  }

  @VuexMutation
  setPrimaryColor(color: string) {
    this.primaryColor = color;
    Vue.ls.set(SET_PRIMARY_COLOR, color);
  }

  @VuexMutation
  setContentWidth(type: ContentWidth) {
    this.contentWidth = type;
    Vue.ls.set(SET_CONTENT_WIDTH, type);
  }

  @VuexMutation
  toggleFixedHeader(mode: boolean) {
    this.fixedHeader = mode;
    Vue.ls.set(TOGGLE_FIXED_HEADER, mode);
  }

  @VuexMutation
  toggleFixSidebar(mode: boolean) {
    this.fixSidebar = mode;
    Vue.ls.set(TOGGLE_FIX_SIDEBAR, mode);
  }

  @VuexMutation
  toggleSideCollapsed(mode: boolean) {
    this.sideCollapsed = mode;
    Vue.ls.set(TOGGLE_SIDE_COLLAPSED, mode);
  }

  @VuexMutation
  toggleColorWeak(mode: boolean) {
    this.colorWeak = mode;
    Vue.ls.set(TOGGLE_COLOR_WEAK, mode);
  }

  @VuexMutation
  toggleAutoHideHeader(mode: boolean) {
    this.autoHideHeader = mode;
    Vue.ls.set(TOGGLE_AUTO_HIDE_HEADER, mode);
  }

  @VuexMutation
  toggleMultiTab(mode: boolean) {
    this.multiTab = mode;
    Vue.ls.set(TOGGLE_MULTI_TAB, mode);
  }

  /**
   * 获取语言
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
  addSupportLanguages(languages: LangConfig[]) {
    this.supportLanguages = this.supportLanguages.concat(languages);
  }

  /**
   * 检查DB是否需要初始化, false 表示不需要初始了
   */
  @VuexAction({ rawError: true })
  checkDB() {
    return httpClient.get<CheckResponse>('/init/check').then((model) => {
      if (model.success) {
        return model.initRequired;
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
    return httpClient.post('/init/start', params).then((model) => {
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
