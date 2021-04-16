import { Vue, Component } from 'nuxt-property-decorator';
import { appStore } from '@/store/modules';
import { Layout, Theme, ContentWidth } from '@/config/proLayoutConfigs';

// Types
import { Menu } from 'types/functions';

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

  /**
   * 菜单角色权限过滤
   */
  menuRoleFilter(menus: Menu[]): Menu[] {
    return menus
      .map((menu) => {
        // 根目录没有设置权限，或有权限
        if (!menu.capabilities || this.hasCapability(menu.capabilities)) {
          // 如果有设置子目录，判断权限，否则直接显示
          if (menu.children) {
            const children = menu.children
              .map((child) => {
                // 子目录有权限
                if (!child.capabilities || this.hasCapability(child.capabilities)) {
                  return child;
                }
                return false;
              })
              .filter(Boolean);
            // 如果不在在子目录，则根目录也一同不显示
            if (children.length) {
              return {
                ...menu,
                children,
              };
            }
            return false;
          }
          return menu;
        }
        return false;
      })
      .filter(Boolean) as Menu[];
  }
}
