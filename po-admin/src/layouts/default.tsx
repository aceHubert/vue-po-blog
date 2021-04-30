import { mixins, Component, Watch } from 'nuxt-property-decorator';
// @ts-ignore
import ProLayout from '@ant-design-vue/pro-layout';
import { appMixin, deviceMixin } from '@/mixins';
import { RightContent, Breadcrumb, GlobalFooter } from '@/components';
import { appStore, userStore } from '@/store/modules';
import { getDefaultMenus } from '@/config/menuCofnigs';
import config, { ContentWidth, Layout } from '@/config/proLayoutConfigs';
import classes from './styles/default.less?module';

// Types
import { RouteConfig } from 'vue-router';
import { User, Actions } from '@/components/GlobalHeader/AvatarDropdown';

@Component<DefaultLayout>({
  name: 'DefaultLayout',
})
export default class DefaultLayout extends mixins(appMixin, deviceMixin) {
  get defaultMenus() {
    return getDefaultMenus((key, fallback) => this.$tv(key, fallback) as string);
  }

  get menus() {
    const routerReslove = this.$router.resolve.bind(this.$router);
    const menus = this.menuRoleFilter(this.defaultMenus);

    return (function formatMenus(menus): RouteConfig[] {
      return menus.map(({ name, title, icon, children }) => ({
        name,
        path: routerReslove({ name }).href,
        meta: { title, icon },
        children: children && children.length ? formatMenus(children) : undefined,
      }));
    })(menus);
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

  //pro-layout 配置
  get settings() {
    return {
      title: config.settings.title, // 标题
      logo: config.settings.logo, // Logo
      layout: this.layout,
      theme: this.theme,
      primaryColor: this.primaryColor,
      contentWidth: this.layout === Layout.sideMenu ? ContentWidth.Fluid : this.contentWidth,
      fixedHeader: this.fixedHeader,
      fixSiderbar: this.fixSiderbar,
      colorWeak: this.colorWeak,
      hideHintAlert: true,
      hideCopyButton: true,
    };
  }

  @Watch('isDesktop')
  watchIsDesktop(val: boolean) {
    if (!val) {
      this.setSideCollapsed(false);
      this.setContentWidth(ContentWidth.Fluid);
    }
  }

  mounted() {
    const userAgent = navigator.userAgent;
    if (userAgent.indexOf('Edge') > -1) {
      this.$nextTick(() => {
        this.setSideCollapsed(!this.sideCollapsed);
        setTimeout(() => {
          this.setSideCollapsed(!this.sideCollapsed);
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

  i18nRender(key: string) {
    return this.$i18n.tv(key, key);
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
    this.$i18n.locale = locale;

    userStore.updateUserMeta({ metaKey: 'locale', metaValue: locale }).catch(() => {
      // ate by dog
    });
  }

  handleCollapse(val: boolean) {
    this.setSideCollapsed(val);
  }

  // handleSettingChange({ type, value }) {
  //   type && (this.settings[type] = value);
  //   switch (type) {
  //     case 'contentWidth':
  //       this.settings[type] = value;
  //       break;
  //     case 'layout':
  //       if (value === 'sidemenu') {
  //         this.settings.contentWidth = CONTENT_WIDTH.Fluid;
  //       } else {
  //         this.settings.fixSiderbar = false;
  //         this.settings.contentWidth = CONTENT_WIDTH.Fixed;
  //       }
  //       break;
  //   }
  // },

  handleAction(key: Actions) {
    if (key === Actions.Profile) {
      this.$router.push({ name: 'profile' });
    } else if (key === Actions.Settings) {
      this.$router.push({ name: 'settings-general' });
    } else if (key === Actions.Logout) {
      this.$router.replace('/logout');
    }
  }

  render() {
    return (
      <ProLayout
        menus={this.menus}
        collapsed={this.sideCollapsed}
        isMobile={!this.isDesktop}
        handleMediaQuery={() => {}}
        handleCollapse={this.handleCollapse.bind(this)}
        // i18nRender={this.i18nRender.bind(this)}
        {...{ props: this.settings }}
      >
        {/* <template #menuHeaderRender>
        <div>
          <logo-svg />
          <h1>{{ title }}</h1>
        </div>
      </template>  */}
        <template slot="headerContentRender">
          {this.settings.layout !== 'topmenu' && !this.isMobile ? (
            <Breadcrumb style="padding: 0 12px; line-height: 64px" />
          ) : null}
        </template>
        <template slot="rightContentRender">
          <RightContent
            topMenu={this.settings.layout === Layout.topMenu}
            isMobile={this.isMobile}
            user={this.currentUser}
            theme={this.settings.theme}
            showLocale={false}
            locale={this.$i18n.locale}
            support-languages={this.supportLanguages}
            onLocaleChange={this.handleLocaleChange.bind(this)}
            onAction={this.handleAction.bind(this)}
          />
        </template>
        <template slot="footerRender">
          <GlobalFooter />
        </template>

        {/* <setting-drawer :settings="settings" @change="handleSettingChange" />  */}
        <nuxt class={[classes.contentWrapper, `theme-${this.theme}`, `is-${this.device}`]} />
      </ProLayout>
    );
  }
}
