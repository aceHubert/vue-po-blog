import { VuexModule, Module, Mutation, Action, getModule } from 'vuex-module-decorators';
import merge from 'lodash.merge';
import { store } from '@/store';

// Types
import { Settings, Locale } from 'types/functions/site';

@Module({ dynamic: true, store, name: 'app', namespaced: true })
class AppStore extends VuexModule {
  locale: Locale = {
    default: 'en',
    supportLanguages: [
      {
        name: '简体中文',
        shortName: '中',
        locale: 'zh-CN',
        fallback: true,
      },
      {
        name: 'English',
        shortName: 'EN',
        locale: 'en-US',
        alternate: 'en',
      },
    ],
  };

  settings: Settings = {
    name: '',
    domain: '',
    icp: null,
    copyright: null,
    staticDir: 'static/',
    apiPath: 'api/blog/',
  };

  @Mutation
  SET_SETTINGS(settings: Partial<Settings>) {
    merge(this.settings, settings);
  }

  @Mutation
  SET_LOCALE(locale: Locale) {
    merge(this.locale, locale);
  }

  /**
   * 网站配置
   * @param settings
   */
  @Action
  SetSetting(settings: Partial<Settings>) {
    this.SET_SETTINGS(settings);
  }

  /**
   * 多语言配置
   * @param locale
   */
  @Action
  SetLocale(locale: Locale) {
    this.SET_LOCALE(locale);
  }
}

export default getModule(AppStore);
