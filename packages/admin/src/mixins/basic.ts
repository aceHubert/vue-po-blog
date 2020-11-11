import Vue from 'vue';
import { mapState } from 'vuex';

export default Vue.extend({
  computed: {
    ...mapState('app', {
      layoutMode: (state: any) => state.layout,
      navTheme: (state: any) => state.theme,
      primaryColor: (state: any) => state.color,
      colorWeak: (state: any) => state.weak,
      fixedHeader: (state: any) => state.fixedHeader,
      fixSiderbar: (state: any) => state.fixSiderbar,
      fixSidebar: (state: any) => state.fixSiderbar,
      contentWidth: (state: any) => state.contentWidth,
      autoHideHeader: (state: any) => state.autoHideHeader,
      sidebarOpened: (state: any) => state.sidebar,
      multiTab: (state: any) => state.multiTab,
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
