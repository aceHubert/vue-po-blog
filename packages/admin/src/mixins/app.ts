import Vue from 'vue';
import { mapState } from 'vuex';

// Types
import { AppState } from '@/store/modules/app';

export default Vue.extend({
  computed: {
    ...mapState<AppState, Dictionary<(state: AppState) => any>>('app', {
      layoutMode: (state) => state.layout,
      navTheme: (state) => state.theme,
      primaryColor: (state) => state.color,
      colorWeak: (state) => state.weak,
      fixedHeader: (state) => state.fixedHeader,
      fixedSiderbar: (state) => state.fixedSidebar,
      contentWidth: (state) => state.contentWidth,
      autoHideHeader: (state) => state.autoHideHeader,
      sidebarOpened: (state) => !state.sideCollapsed,
      multiTab: (state) => state.multiTab,
    }),
  },
  methods: {
    isTopMenu() {
      return this.layoutMode === 'topmenu';
    },
    isSideMenu() {
      return !this.isTopMenu();
    },
  },
});
