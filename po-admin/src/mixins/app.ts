import { Vue, Component } from 'nuxt-property-decorator';
import { appStore } from '@/store/modules';
import { Layout, ContentWidth, Theme } from '@/configs/settings.config';

@Component
export default class AppMixin extends Vue {
  /** admin logo */
  get siteLogo() {
    return appStore.layout.logo;
  }

  /** Admin site title */
  get siteTitle() {
    return appStore.layout.title;
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
    return appStore.layout.theme;
  }

  get isDark() {
    return this.theme === Theme.Dark || this.theme === Theme.RealDark;
  }

  get isRealDark() {
    return this.theme === Theme.RealDark;
  }

  get isLight() {
    return !this.isDark;
  }

  get primaryColor() {
    return appStore.layout.primaryColor;
  }

  get fixedHeader() {
    return appStore.layout.fixedHeader;
  }

  get fixSiderbar() {
    return appStore.layout.fixSiderbar;
  }

  get contentWidth() {
    return this.layoutType === Layout.SideMenu ? ContentWidth.Fluid : appStore.layout.contentWidth;
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
}
