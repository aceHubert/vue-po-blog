import warning from 'warning';
import { Vue, Component, Watch } from 'nuxt-property-decorator';
import { appStore } from '@/store/modules';
import { Layout, ContentWidth, Theme } from '@/configs/settings.config';

// Types
import { Locale } from 'ant-design-vue/types/locale-provider';

@Component<AppMixin>({
  head() {
    return {
      link: this.isDark ? [{ rel: 'stylesheet', href: '/assets/themes/dark.css', hid: 'po-theme' }] : [],
    };
  },
})
export default class AppMixin extends Vue {
  antLocale?: Locale = {} as Locale;

  @Watch('locale', { immediate: true })
  watchLocale(val: string) {
    this.loadAntLocaleAsync(val)
      .then((locale) => {
        this.antLocale = locale;
      })
      .catch((err) => {
        warning(process.env.NODE_ENV === 'production', err.message);
      });
  }

  /** admin logo */
  get siteLogo() {
    return appStore.layout.logo;
  }

  /** Admin site title */
  get siteTitle() {
    return appStore.layout.title;
  }

  get locale() {
    return appStore.locale;
  }

  get layoutType() {
    return appStore.layout.layout;
  }

  get hasTopMenu() {
    return this.layoutType === Layout.TopMenu;
  }

  get hasSiderMenu() {
    return !this.hasTopMenu;
  }

  get theme() {
    return appStore.color.theme;
  }

  get isDark() {
    return this.theme === Theme.Dark;
  }

  get isLight() {
    return !this.isDark;
  }

  get isRealLight() {
    return this.theme === Theme.RealLight;
  }

  get primaryColor() {
    return appStore.color.primaryColor;
  }

  get fixedHeader() {
    return appStore.layout.fixedHeader;
  }

  get fixSiderbar() {
    return appStore.layout.fixSiderbar;
  }

  get contentWidth() {
    return this.layoutType === Layout.SiderMenu ? ContentWidth.Fluid : appStore.layout.contentWidth;
  }

  get colorWeak() {
    return appStore.layout.colorWeak;
  }

  get autoHideHeader() {
    return appStore.layout.autoHideHeader;
  }

  get multiTab() {
    return appStore.layout.multiTab;
  }

  /**
   * 加载 antd 语言文件
   */
  loadAntLocaleAsync(locale: string): Promise<Locale> {
    return import(`ant-design-vue/lib/locale/${locale.replace(/-/g, '_')}.js`).then((data) => data.default || data);
  }

  loadThemeCss(theme: 'light' | 'dark') {
    if (document) {
      const themeLink = document.querySelector<HTMLLinkElement>('link[data-hid="po-theme"]');
      themeLink && (themeLink.href = `/static/assets/themes/${theme}.css`);
    }
  }
}
