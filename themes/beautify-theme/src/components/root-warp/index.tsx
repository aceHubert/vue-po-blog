import { Vue, Component, Watch } from 'vue-property-decorator';
import {
  VApp,
  VNavigationDrawer,
  VList,
  VListItem,
  VListItemTitle,
  VListItemIcon,
  VListItemContent,
  VIcon,
  VAvatar,
  VImg,
  VDivider,
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
      order: 0,
    },
    {
      label: '归档',
      icon: 'mdi-archive',
      to: { name: 'theme-archive' },
      order: 1,
    },
    {
      label: '关于',
      icon: 'mdi-account',
      to: { name: 'theme-about-me' },
      order: 2,
    },
  ],
});

@Component({
  name: 'theme-root-warp',
})
export default class RootWarp extends Vue {
  get userInfo() {
    return this.getUserInfo();
  }

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
        RootParams.menus = menus.sort((a, b) => (a.order === b.order ? 0 : a.order > b.order ? 1 : -1));
      });
  }

  render() {
    return (
      <VApp>
        <VNavigationDrawer v-model={RootParams.drawerShown} app disableResizeWatcher disableRouteWatcher>
          <VList dense flat>
            <VListItem class="text-center py-4">
              <div style="width: 100%">
                <VAvatar size="46" class="mb-2">
                  <VImg src={this.userInfo.avatar || 'https://api.adorable.io/avatars/80/abott@adorable.png'} />
                </VAvatar>
                <VListItemTitle>{this.userInfo.email}</VListItemTitle>
              </div>
            </VListItem>
            <VDivider />
            {RootParams.menus.map((menu) => [
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
              </VListItem>,
              <VDivider />,
            ])}
          </VList>
        </VNavigationDrawer>
        {this.$slots.default}
      </VApp>
    );
  }
}
