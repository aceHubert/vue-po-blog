import { mixins, Component, Watch } from 'nuxt-property-decorator';
import { upperFirst } from 'lodash-es';
import { appMixin, deviceMixin } from '@/mixins';
import { Breadcrumb, AvatarDropdown, LocaleDropdown, GlobalFooter } from '@/components';
import { appStore, userStore } from '@/store/modules';
import { getDefaultMenus } from '@/configs/menu.cofnig';
import classes from './styles/default.less?module';

// Types
import { Menu } from 'types/configs/menu';
import { User, Actions } from '@/components/global-header/AvatarDropdown';

@Component<DefaultLayout>({
  name: 'DefaultLayout',
})
export default class DefaultLayout extends mixins(appMixin, deviceMixin) {
  menuOpenKeys!: string[];
  headerHeight!: number;
  siderCollapsed!: boolean;
  siderWidth!: number;

  data() {
    return {
      menuOpenKeys: [],
      headerHeight: 48,
      siderCollapsed: false,
      siderWidth: 256,
    };
  }

  get menus() {
    const defaultMenus = getDefaultMenus((key, fallback) => this.$tv(key, fallback) as string);
    return this.menuRoleFilter(defaultMenus);
  }

  get headerWidth() {
    const needSettingWidth = this.fixedHeader && this.hasSiderMenu && !this.isMobile;
    return needSettingWidth ? `calc(100% - ${this.siderCollapsed ? 80 : this.siderWidth}px)` : '100%';
  }

  get contentPaddingLeft() {
    // If it is a fix menu, calculate padding
    // don't need padding in phone mode
    const hasLeftPadding = this.fixSiderbar && this.hasSiderMenu && !this.isMobile;
    if (hasLeftPadding) {
      return `${this.siderCollapsed ? 80 : this.siderWidth}px`;
    }
    return 0;
  }

  get rootSubmenuKeys() {
    return this.menus.map((menu) => menu.name);
  }

  get currentUser() {
    if (userStore.id) {
      return {
        id: userStore.id,
        name: userStore.info.displayName || userStore.loginName,
        photo: userStore.info.avatar,
      } as User;
    }
    return undefined;
  }

  get supportLanguages() {
    return appStore.supportLanguages;
  }

  @Watch('isDesktop')
  watchIsDesktop(val: boolean) {
    if (!val) {
      this.siderCollapsed = true;
      // this.setContentWidth(ContentWidth.Fluid);
    }
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
            if (children.length) {
              return {
                ...menu,
                children,
              };
            }
            // 如果不在在子目录，则根目录也一同不显示
            return false;
          }
          // 没有子目录，直接显示
          return menu;
        }
        // 没有权限
        return false;
      })
      .filter(Boolean) as Menu[];
  }

  // addSiderMenus(menus, parentName) {
  //   if (parentName) {
  //     const parent = globalSettings.siderMenus.find((menu) => menu.name === parentName);
  //     // 只有 children 被定义了才能加
  //     if (parent && parent.children) {
  //       parent.children.push(...menus);
  //     }
  //   } else {
  //     menus.forEach((menu) => {
  //       if (!menu.icon) {
  //         // todo: 替换一个公用 icon
  //         menu.icon = menuIcon;
  //       }
  //     });
  //     globalSettings.siderMenus.push(...menus);
  //   }
  // }

  handleLocaleChange(locale: string) {
    appStore.setLocale(locale);

    userStore.updateUserMeta({ metaKey: 'locale', metaValue: locale }).catch(() => {
      // ate by dog
    });
  }

  handleAction(key: Actions) {
    if (key === Actions.Profile) {
      this.$router.push({ name: 'profile' });
    } else if (key === Actions.Settings) {
      this.$router.push({ name: 'settings-general' });
    } else if (key === Actions.Logout) {
      this.$router.replace('/logout');
    }
  }

  mounted() {
    this.siderCollapsed = !this.isDesktop;
    const userAgent = navigator.userAgent;
    if (userAgent.indexOf('Edge') > -1) {
      this.$nextTick(() => {
        this.siderCollapsed = !this.siderCollapsed;
        setTimeout(() => {
          this.siderCollapsed = !this.siderCollapsed;
        }, 16);
      });
    }

    // first update color
    // TIPS: THEME COLOR HANDLER!! PLEASE CHECK THAT!!
    if (process.env.NODE_ENV !== 'production' || process.env.VUE_APP_PREVIEW === 'true') {
      // updateTheme(this.settings.primaryColor);
    }

    //setting-drawer theme options
    // if (!window.umi_plugin_ant_themeVar) {
    //   window.umi_plugin_ant_themeVar = config.themeVar;
    // }
  }

  renderLogo(logo: any) {
    if (typeof logo === 'string') {
      return <img src={logo} class="logo" alt="logo" />;
    }

    if (typeof logo === 'function') {
      return logo();
    }

    const Logo = logo;
    return <Logo class="logo" />;
  }

  renderMenu(mode: 'horizontal' | 'inline' = 'inline', classname = '') {
    const httpReg = /(http|https|ftp):\/\/([\w.]+\/?)\S*/;
    const renderIcon = function renderIcon(icon: any) {
      if (icon === undefined || icon === 'none' || icon === null) {
        return null;
      }

      return typeof icon === 'object' ? <a-icon component={icon}></a-icon> : <a-icon type={icon}></a-icon>;
    };

    const renderMenuItem = function renderMenuItem(menu: Menu) {
      return (
        <a-menu-item key={menu.name}>
          {menu.path && httpReg.test(menu.path) ? (
            <a href={menu.path} target={menu.target || '_self'}>
              {renderIcon(menu.icon)}
              <span>{menu.title}</span>
            </a>
          ) : (
            <nuxt-link
              to={menu.path ? { path: menu.path } : { name: menu.name }}
              custom
              {...{
                scopedSlots: {
                  default: ({ href, navigate }: any) => (
                    <a href={href} target={menu.target || '_self'} onClick={navigate}>
                      {renderIcon(menu.icon)}
                      <span>{menu.title}</span>
                    </a>
                  ),
                },
              }}
            ></nuxt-link>
          )}
        </a-menu-item>
      );
    };

    const handleOpenChange = (openKeys: string[]) => {
      // 在水平模式下时，不再执行后续
      if (mode === 'horizontal') {
        this.menuOpenKeys = openKeys;
        return;
      }
      const latestOpenKey = openKeys.find((key) => !this.menuOpenKeys.includes(key));
      if (latestOpenKey && !this.rootSubmenuKeys.includes(latestOpenKey)) {
        this.menuOpenKeys = openKeys;
      } else {
        this.menuOpenKeys = latestOpenKey ? [latestOpenKey] : [];
      }
    };

    const props: Dictionary<any> = {
      mode,
      theme: this.isDark ? 'dark' : 'light',
      openKeys: this.menuOpenKeys,
    };
    if (mode === 'inline') {
      props.inlineCollapsed = this.isMobile ? false : this.siderCollapsed;
    }

    return (
      <a-menu {...{ class: classname, props }} onOpenChange={handleOpenChange}>
        {this.menus.map((menu) =>
          menu.children && menu.children.length ? (
            <a-sub-menu>
              <span slot="title">
                {renderIcon(menu.icon)}
                <span>{menu.title}</span>
              </span>
              {menu.children.map((child) => renderMenuItem(child as Menu))}
            </a-sub-menu>
          ) : (
            renderMenuItem(menu)
          ),
        )}
      </a-menu>
    );
  }

  renderSiderMenu() {
    const sider = (
      <a-layout-sider
        class={[
          classes.layoutSider,
          {
            [classes.layoutSiderFixed]: this.fixSiderbar,
            [classes.hasSiderMenu]: this.hasSiderMenu,
          },
        ]}
        theme={this.isDark ? 'dark' : 'light'}
        width={this.siderWidth}
        trigger={null}
        breakpoint="lg"
        collapsible
        collapsed={this.isMobile ? false : this.siderCollapsed}
      >
        <nuxt-link to="/" class={classes.siderLogo}>
          {this.renderLogo(this.siteLogo)}
          <h1>{this.siteTitle}</h1>
        </nuxt-link>
        {this.renderMenu('inline', classes.siderMenu)}
      </a-layout-sider>
    );

    return this.isMobile ? (
      <a-drawer
        class={classes.layoutSiderDrawer}
        placement="left"
        visible={!this.siderCollapsed}
        maskClosable
        getContainer={null}
        bodyStyle={{
          padding: 0,
          height: '100vh',
        }}
        onClose={() => {
          this.siderCollapsed = true;
        }}
      >
        {sider}
      </a-drawer>
    ) : (
      sider
    );
  }

  renderHeader() {
    const rightContent = (
      <div class={classes.contentRight}>
        <AvatarDropdown
          class={classes.contentRightAction}
          user={this.currentUser}
          onAction={this.handleAction.bind(this)}
        />
        {this.supportLanguages!.length ? (
          <LocaleDropdown
            class={classes.contentRightAction}
            supportLanguages={this.supportLanguages!}
            onChange={this.handleLocaleChange.bind(this)}
          />
        ) : null}
      </div>
    );

    const header = (
      <a-layout-header
        class={[
          classes.layoutHeader,
          {
            [classes.layoutHeaderFixed]: this.fixedHeader,
            [classes.hasTopMenu]: !this.isMobile && this.hasTopMenu,
          },
        ]}
        style={{
          padding: 0,
          height: `${this.headerHeight}px`,
          lineHeight: `${this.headerHeight}px`,
          width: this.headerWidth,
          right: this.fixedHeader ? 0 : undefined,
        }}
      >
        <div class={[classes.layoutHeaderWrapper, classes[`contentWidth${upperFirst(this.contentWidth)}`]]}>
          {this.isMobile ? (
            <nuxt-link to="/" class={classes.headerLogo}>
              {this.renderLogo(this.siteLogo)}
            </nuxt-link>
          ) : this.hasTopMenu ? (
            <nuxt-link to="/" class={classes.headerLogo} style="min-width: 186px">
              {this.renderLogo(this.siteLogo)}
              <h1>{this.siteTitle}</h1>
            </nuxt-link>
          ) : null}

          {this.isMobile || !this.hasTopMenu ? (
            <span class={classes.trigger}>
              <a-icon
                type={this.siderCollapsed ? 'menu-unfold' : 'menu-fold'}
                onClick={() => {
                  this.siderCollapsed = !this.siderCollapsed;
                }}
              />
            </span>
          ) : null}

          <div style="flex: 1 1 0%; min-width:0;">
            {!this.isMobile ? (
              this.hasTopMenu ? (
                this.renderMenu('horizontal', classes.topMenu)
              ) : (
                <div class={classes.content}>
                  <Breadcrumb style="padding: 0 12px; line-height: 64px" />
                </div>
              )
            ) : null}
          </div>
          {this.isMobile ? rightContent : <div style="min-width: 168px;">{rightContent}</div>}
        </div>
      </a-layout-header>
    );

    return this.fixedHeader
      ? [
          <a-layout-header
            style={{
              height: `${this.headerHeight}px`,
              lineHeight: `${this.headerHeight}px`,
              background: 'transparent',
            }}
          ></a-layout-header>,
          header,
        ]
      : header;
  }

  renderContent() {
    return (
      <a-layout-content class={[classes.layoutContent]}>
        <div class={[classes.layoutContentWrapper, classes[`contentWidth${upperFirst(this.contentWidth)}`]]}>
          <nuxt class={classes.contentWrapper} />
        </div>
      </a-layout-content>
    );
  }

  renderFooter() {
    return (
      <a-layout-footer class={classes.layoutFooter}>
        <GlobalFooter>
          <template slot="links">
            <a href="https://github.com/aceHubert/vue-po-blog" target="_blank">
              <a-icon type="github" />
              GitHub
            </a>
          </template>
        </GlobalFooter>
      </a-layout-footer>
    );
  }

  render() {
    return (
      <a-layout id="layout-default" class={[classes.layoutWrapper, `theme-${this.theme}`, `is-${this.device}`]}>
        {this.hasSiderMenu || this.isMobile ? this.renderSiderMenu() : null}
        <a-layout
          style={{
            paddingLeft: this.hasSiderMenu ? this.contentPaddingLeft : undefined,
            minHeight: '100vh',
          }}
        >
          {this.renderHeader()}
          {this.renderContent()}
          {this.renderFooter()}
        </a-layout>
      </a-layout>
    );
  }
}
