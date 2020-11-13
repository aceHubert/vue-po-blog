import Vue from 'vue';
import {
  SIDEBAR_TYPE,
  TOGGLE_NAV_THEME,
  TOGGLE_LAYOUT,
  TOGGLE_FIXED_HEADER,
  TOGGLE_FIXED_SIDEBAR,
  TOGGLE_CONTENT_WIDTH,
  TOGGLE_HIDE_HEADER,
  TOGGLE_COLOR,
  TOGGLE_WEAK,
  TOGGLE_MULTI_TAB,
} from '@/config/mutationTypes';
// Types
import { Module } from 'vuex';
import { RootState } from '../';

export type AppState = {
  sideCollapsed: boolean;
  theme: string;
  layout: string;
  contentWidth: string;
  fixedHeader: boolean;
  fixedSidebar: boolean;
  autoHideHeader: boolean;
  color: string | null;
  weak: boolean;
  multiTab: boolean;
};

const app: Module<AppState, RootState> = {
  namespaced: true,
  state: {
    sideCollapsed: false,
    theme: 'dark',
    layout: '',
    contentWidth: '',
    fixedHeader: false,
    fixedSidebar: false,
    autoHideHeader: false,
    color: '',
    weak: false,
    multiTab: true,
  },
  mutations: {
    [SIDEBAR_TYPE]: (state, type) => {
      state.sideCollapsed = type;
      Vue.ls.set(SIDEBAR_TYPE, type);
    },
    [TOGGLE_NAV_THEME]: (state, theme) => {
      state.theme = theme;
      Vue.ls.set(TOGGLE_NAV_THEME, theme);
    },
    [TOGGLE_LAYOUT]: (state, mode) => {
      state.layout = mode;
      Vue.ls.set(TOGGLE_LAYOUT, mode);
    },
    [TOGGLE_FIXED_HEADER]: (state, mode) => {
      state.fixedHeader = mode;
      Vue.ls.set(TOGGLE_FIXED_HEADER, mode);
    },
    [TOGGLE_FIXED_SIDEBAR]: (state, mode) => {
      state.fixedSidebar = mode;
      Vue.ls.set(TOGGLE_FIXED_SIDEBAR, mode);
    },
    [TOGGLE_CONTENT_WIDTH]: (state, type) => {
      state.contentWidth = type;
      Vue.ls.set(TOGGLE_CONTENT_WIDTH, type);
    },
    [TOGGLE_HIDE_HEADER]: (state, type) => {
      state.autoHideHeader = type;
      Vue.ls.set(TOGGLE_HIDE_HEADER, type);
    },
    [TOGGLE_COLOR]: (state, color) => {
      state.color = color;
      Vue.ls.set(TOGGLE_COLOR, color);
    },
    [TOGGLE_WEAK]: (state, mode) => {
      state.weak = mode;
      Vue.ls.set(TOGGLE_WEAK, mode);
    },
    [TOGGLE_MULTI_TAB]: (state, bool) => {
      Vue.ls.set(TOGGLE_MULTI_TAB, bool);
      state.multiTab = bool;
    },
  },
};

export default app;
