import { Vue, Component } from 'nuxt-property-decorator';
import appStore from '@/store/modules/app';
import { Layout, Theme, ContentWidth } from '@/config/proLayoutConfigs';

@Component
export default class AppMixin extends Vue {
  get layout() {
    return appStore.layout;
  }

  get theme() {
    return appStore.theme;
  }

  get isDark() {
    return appStore.isDark;
  }

  get isLight() {
    return appStore.isLight;
  }

  get primaryColor() {
    return appStore.primaryColor;
  }

  get fixedHeader() {
    return appStore.fixedHeader;
  }

  get fixSiderbar() {
    return appStore.fixSidebar;
  }

  get contentWidth() {
    return appStore.contentWidth;
  }

  get sideCollapsed() {
    return appStore.sideCollapsed;
  }

  get colorWeak() {
    return appStore.colorWeak;
  }

  get autoHideHeader() {
    return appStore.autoHideHeader;
  }

  get multiTab() {
    return appStore.multiTab;
  }

  isTopMenu() {
    return this.layout === Layout.topMenu;
  }
  isSideMenu() {
    return !this.isTopMenu();
  }
  setLayout(val: Layout) {
    appStore.setLayout(val);
  }
  setTheme(val: Theme) {
    appStore.setTheme(val);
  }
  setPrimaryColor(val: string) {
    appStore.setPrimaryColor(val);
  }
  setContentWidth(val: ContentWidth) {
    appStore.setContentWidth(val);
  }
  setFixedHeader(val: boolean) {
    appStore.toggleFixedHeader(val);
  }
  setFixedSidebar(val: boolean) {
    appStore.toggleFixSidebar(val);
  }
  setSideCollapsed(val: boolean) {
    appStore.toggleSideCollapsed(val);
  }
  setAutoHideHeader(val: boolean) {
    appStore.toggleAutoHideHeader(val);
  }
  setColorWeak(val: boolean) {
    appStore.toggleColorWeak(val);
  }
}
