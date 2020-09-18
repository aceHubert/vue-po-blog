import { Vue, Component, Watch } from 'vue-property-decorator';
import {
  VApp,
  VNavigationDrawer,
  VList,
  VListItem,
  VListItemTitle,
  VListItemIcon,
  VIcon,
  VListItemContent,
} from '../vuetify-tsx';

export const RootParams: {
  drawerShown: boolean;
  menus: Menu[];
} = Vue.observable({
  drawerShown: false,
  menus: [
    {
      label: '首页',
      icon: 'mdi-home',
      to: { name: 'index' },
      index: 0,
    },
    {
      label: '归档',
      icon: 'mdi-archive',
      to: { name: 'theme-archive' },
      index: 2,
    },
    {
      label: '关于我',
      icon: 'mdi-account',
      to: { name: 'theme-about-me' },
      index: 3,
    },
  ],
});

@Component({
  name: 'theme-root-warp',
})
export default class RootWarp extends Vue {
  searchText = 'Search';

  @Watch('$vuetify.breakpoint.mdAndUp')
  watchIsMobile(val: boolean) {
    if (val && RootParams.drawerShown) {
      RootParams.drawerShown = false;
    }
  }

  created() {
    this.hook('header-menus')
      .filter(RootParams.menus)
      .then((menus: Menu[]) => {
        RootParams.menus = menus.sort((a, b) => (a.index > b.index ? 1 : -1));
      });
  }

  render() {
    return (
      <VApp>
        <VNavigationDrawer v-model={RootParams.drawerShown} app disableResizeWatcher disableRouteWatcher>
          <VList dense flat>
            {RootParams.menus.map((menu) => (
              <VListItem
                to={menu.to}
                exact
                nuxt
                activeClass="accent--text"
                onClick={() => {
                  RootParams.drawerShown = false;
                }}
              >
                <VListItemIcon>{menu.icon ? <VIcon>{menu.icon}</VIcon> : null}</VListItemIcon>
                <VListItemContent>
                  <VListItemTitle>{menu.label}</VListItemTitle>
                </VListItemContent>
              </VListItem>
            ))}
          </VList>
        </VNavigationDrawer>
        {this.$slots.default}
      </VApp>
    );
  }
}
