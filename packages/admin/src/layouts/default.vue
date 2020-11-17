<template>
  <pro-layout
    class="layout layout--default"
    :menus="menus"
    :collapsed="collapsed"
    :mediaQuery="query"
    :isMobile="isMobile"
    :handleMediaQuery="handleMediaQuery"
    :handleCollapse="handleCollapse"
    :i18nRender="i18nRender"
    v-bind="settings"
  >
    <template v-slot:menuHeaderRender>
      <div>
        <logo-svg />
        <h1>{{ title }}</h1>
      </div>
    </template>

    <template v-slot:rightContentRender>
      <right-content
        :top-menu="settings.layout === 'topmenu'"
        :is-mobile="isMobile"
        :theme="settings.theme"
        :locale="$i18n.locale"
        :support-languages="supportLanguages"
        @changeLang="handleChangeLang"
        @action="handleAction"
      />
    </template>
    <template v-slot:footerRender>
      <global-footer></global-footer>
    </template>
    <!-- <setting-drawer :settings="settings" @change="handleSettingChange" /> -->
    <router-view class="content" />
  </pro-layout>
</template>

<script type="ts">
// import { SettingDrawer, updateTheme } from '@ant-design-vue/pro-layout';
import { RightContent, GlobalFooter } from '@/components';
import { localeFuncs, settingsFuncs } from '@/includes/functions';
import LogoSvg from '@/assets/images/logo.svg?inline';
import { CONTENT_WIDTH_TYPE, SIDEBAR_TYPE } from '@/config/mutationTypes';
import defaultSettings from '@/config/layoutSettings';

export default {
  name: 'DefaultLayout',
  components: {
    // SettingDrawer,
    RightContent,
    GlobalFooter,
    LogoSvg,
  },
  data() {
    return {
      menus: [],
      // 侧栏收起状态
      collapsed: false,
      title: defaultSettings.title,
      settings: {
        // 布局类型
        layout: defaultSettings.layout, // 'sidemenu', 'topmenu'
        // CONTENT_WIDTH_TYPE
        contentWidth: defaultSettings.layout === 'sidemenu' ? CONTENT_WIDTH_TYPE.Fluid : defaultSettings.contentWidth,
        // 主题 'dark' | 'light'
        theme: defaultSettings.navTheme,
        // 主色调
        primaryColor: defaultSettings.primaryColor,
        fixedHeader: defaultSettings.fixedHeader,
        fixSiderbar: defaultSettings.fixSiderbar,
        colorWeak: defaultSettings.colorWeak,
        hideHintAlert: false,
        hideCopyButton: false,
      },
      supportLanguages: localeFuncs.getSupportLanguages(),
      // 媒体查询
      query: {},
      // 是否手机模式
      isMobile: false,
    };
  },
  computed: {
    contentPaddingLeft() {
      if (!this.fixSidebar || this.isMobile()) {
        return '0';
      }
      if (this.sidebarOpened) {
        return '256px';
      }
      return '80px';
    },
  },
  watch: {
    sidebarOpened(val) {
      this.collapsed = !val;
    },
  },
  created() {
    const routerReslove = this.$router.resolve.bind(this.$router);
    this.menus = (function formatMenus(menus) {
      return menus.map(({ name, title, icon, children }) => ({
        name,
        path: routerReslove({ name }).href,
        meta: { title, icon },
        children: children && children.length ? formatMenus(children) : null,
      }));
    })(settingsFuncs.getSiderMenus());
    // 处理侧栏收起状态
    this.$watch('collapsed', () => {
      this.$store.commit(`app/${SIDEBAR_TYPE}`, this.collapsed);
    });
  },
  mounted() {
    const userAgent = navigator.userAgent;
    if (userAgent.indexOf('Edge') > -1) {
      this.$nextTick(() => {
        this.collapsed = !this.collapsed;
        setTimeout(() => {
          this.collapsed = !this.collapsed;
        }, 16);
      });
    }

    // first update color
    // TIPS: THEME COLOR HANDLER!! PLEASE CHECK THAT!!
    if (process.env.NODE_ENV !== 'production' || process.env.VUE_APP_PREVIEW === 'true') {
      // updateTheme(this.settings.primaryColor);
    }
  },
  methods: {
    i18nRender(key) {
      return this.$i18n.t(`${key}`);
    },
    handleMediaQuery(val) {
      this.query = val;
      if (this.isMobile && !val['screen-xs']) {
        this.isMobile = false;
        return;
      }
      if (!this.isMobile && val['screen-xs']) {
        this.isMobile = true;
        this.collapsed = false;
        this.settings.contentWidth = CONTENT_WIDTH_TYPE.Fluid;
        // this.settings.fixSiderbar = false
      }
    },
    handleCollapse(val) {
      this.collapsed = val;
    },
    handleSettingChange({ type, value }) {
      type && (this.settings[type] = value);
      switch (type) {
        case 'contentWidth':
          this.settings[type] = value;
          break;
        case 'layout':
          if (value === 'sidemenu') {
            this.settings.contentWidth = CONTENT_WIDTH_TYPE.Fluid;
          } else {
            this.settings.fixSiderbar = false;
            this.settings.contentWidth = CONTENT_WIDTH_TYPE.Fixed;
          }
          break;
      }
    },
    handleChangeLang(locale) {
      this.$i18n.loadLanguageAsync(locale);
    },
    handleAction(key) {
      if (key === 'center') {
        this.$router.push({ name: 'account-user' });
      } else if (key === 'settings') {
        this.$router.push({ name: 'account-settings' });
      } else if (key === 'logout') {
        this.$store.dispatch('user/logout').then(() => {
          this.$router.push({ name: 'login' });
        });
      }
    },
  },
};
</script>

<style lang="less">
.ant-pro-global-header-index-right {
  margin-right: 8px;

  &.ant-pro-global-header-index-dark {
    .ant-pro-global-header-index-action {
      color: hsla(0, 0%, 100%, 0.85);

      &:hover {
        background: #1890ff;
      }
    }
  }

  .ant-pro-account-avatar {
    .antd-pro-global-header-index-avatar {
      margin: ~'calc((@{layout-header-height} - 24px) / 2)' 0;
      margin-right: 8px;
      color: @primary-color;
      vertical-align: top;
      background: rgba(255, 255, 255, 0.85);
    }
  }

  .menu {
    .anticon {
      margin-right: 8px;
    }

    .ant-dropdown-menu-item {
      min-width: 100px;
    }
  }
}
</style>
