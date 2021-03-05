import Vue from 'vue';
import appStore from '@/store/modules/app';
import userStore from '@/store/modules/user';
import cookie from '@/utils/cookie';
import config, {
  SET_LAYOUT,
  SET_THEME,
  SET_PRIMARY_COLOR,
  SET_CONTENT_WIDTH,
  TOGGLE_FIXED_HEADER,
  TOGGLE_FIX_SIDEBAR,
  TOGGLE_SIDE_COLLAPSED,
  TOGGLE_COLOR_WEAK,
  TOGGLE_AUTO_HIDE_HEADER,
  TOGGLE_MULTI_TAB,
  ACCESS_TOKEN,
} from '@/config/proLayoutConfigs';

// Tpyes
import { Plugin } from '@nuxt/types';

// 从 localStorage 中加载本地化数据
export async function Initializer(...params: Parameters<Plugin>) {
  const cxt = params[0];
  const { route } = cxt;

  if (process.client) {
    appStore.setLayout(Vue.ls.get(SET_LAYOUT, config.settings.layout));
    appStore.setTheme(Vue.ls.get(SET_THEME, config.settings.theme));
    appStore.setPrimaryColor(Vue.ls.get(SET_PRIMARY_COLOR, config.settings.primaryColor));
    appStore.setContentWidth(Vue.ls.get(SET_CONTENT_WIDTH, config.settings.contentWidth));
    appStore.toggleFixedHeader(Vue.ls.get(TOGGLE_FIXED_HEADER, config.settings.fixedHeader));
    appStore.toggleFixSidebar(Vue.ls.get(TOGGLE_FIX_SIDEBAR, config.settings.fixSiderbar));
    appStore.toggleSideCollapsed(Vue.ls.get(TOGGLE_SIDE_COLLAPSED, config.settings.sideCollapsed));
    appStore.toggleSideCollapsed(Vue.ls.get(TOGGLE_COLOR_WEAK, config.settings.colorWeak));
    appStore.toggleAutoHideHeader(Vue.ls.get(TOGGLE_AUTO_HIDE_HEADER, config.settings.autoHideHeader));
    appStore.toggleMultiTab(Vue.ls.get(TOGGLE_MULTI_TAB, config.settings.multiTab));
  } else {
    // ssr
  }

  // init/login/logout/register/lost-password 页面排除
  if (route.name !== 'init' && !route.name?.startsWith('account-')) {
    // 设置token
    const accessToken = process.client
      ? cookie.clientCookie.get(ACCESS_TOKEN)
      : cookie.serverCookie(cxt.req, cxt.res).get(ACCESS_TOKEN);

    if (accessToken) {
      userStore.setAccessToken(accessToken);
    }
  }

  return true;
}
