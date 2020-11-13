import Vue from 'vue';
import { store } from '@/store';
import {
  TOGGLE_CONTENT_WIDTH,
  TOGGLE_FIXED_HEADER,
  TOGGLE_FIXED_SIDEBAR,
  TOGGLE_HIDE_HEADER,
  TOGGLE_LAYOUT,
  TOGGLE_NAV_THEME,
  TOGGLE_WEAK,
  TOGGLE_COLOR,
  TOGGLE_MULTI_TAB,
} from '@/config/mutationTypes';
import config from '@/config/layoutSettings';

export default function Initializer() {
  store.commit(`app/${TOGGLE_LAYOUT}`, Vue.ls.get(TOGGLE_LAYOUT, config.layout));
  store.commit(`app/${TOGGLE_FIXED_HEADER}`, Vue.ls.get(TOGGLE_FIXED_HEADER, config.fixedHeader));
  store.commit(`app/${TOGGLE_FIXED_SIDEBAR}`, Vue.ls.get(TOGGLE_FIXED_SIDEBAR, config.fixSiderbar));
  store.commit(`app/${TOGGLE_CONTENT_WIDTH}`, Vue.ls.get(TOGGLE_CONTENT_WIDTH, config.contentWidth));
  store.commit(`app/${TOGGLE_HIDE_HEADER}`, Vue.ls.get(TOGGLE_HIDE_HEADER, config.autoHideHeader));
  store.commit(`app/${TOGGLE_NAV_THEME}`, Vue.ls.get(TOGGLE_NAV_THEME, config.navTheme));
  store.commit(`app/${TOGGLE_WEAK}`, Vue.ls.get(TOGGLE_WEAK, config.colorWeak));
  store.commit(`app/${TOGGLE_COLOR}`, Vue.ls.get(TOGGLE_COLOR, config.primaryColor));
  store.commit(`app/${TOGGLE_MULTI_TAB}`, Vue.ls.get(TOGGLE_MULTI_TAB, config.multiTab));

  // store.dispatch('setLang', Vue.ls.get(APP_LANGUAGE, 'en-US'))
  // last step
}
