import { Vue, Component } from 'vue-property-decorator';
import { VAppBar, VContainer, VAppBarNavIcon, VToolbarTitle, VSpacer, VIcon, VBtn } from '../vuetify-tsx';
import { RootParams } from '../RootWarp';
import './Header.scss';

@Component({
  name: 'theme-header',
})
export default class Header extends Vue {
  get logo() {
    const logo = this.getLogo();
    if (logo) {
      if (logo.type === 'text') {
        return <span class="b-theme-logo--text">{logo.content}</span>;
      } else if (logo.type === 'image') {
        return <img class="b-theme-logo" src={logo} alt="logo" />;
      } else {
        // todo: 混合
        return null;
      }
    }
    return <img class="b-theme-logo" src="/images/logo.png" alt="logo" />;
  }

  render() {
    return (
      <VAppBar app>
        <VContainer class="b-theme-container">
          <VAppBarNavIcon
            class="hidden-md-and-up"
            onClick={() => {
              RootParams.drawerShown = true;
            }}
          ></VAppBarNavIcon>
          <VToolbarTitle>{this.logo}</VToolbarTitle>
          <VSpacer />
          {this.$vuetify.breakpoint.mdAndUp ? (
            <div class="subtitle-2 hidden-sm-and-down">
              {RootParams.menus.map((menu) => (
                <nuxt-link
                  to={menu.to}
                  exact
                  active-class="primary--text"
                  class="ml-3 text-decoration-none text-no-wrap"
                  style="color:inherit;"
                >
                  {menu.icon ? (
                    <VIcon size="1.25em" class="mr-1 b-theme-menu-icon">
                      {menu.icon}
                    </VIcon>
                  ) : null}
                  {menu.label}
                </nuxt-link>
              ))}
              <VBtn small icon class="ml-3" onClick={() => this.$router.push({ name: 'b-theme-search' })}>
                <VIcon>mdi-magnify</VIcon>
              </VBtn>
            </div>
          ) : (
            <VBtn icon onClick={() => this.$router.push({ name: 'b-theme-search' })}>
              <VIcon>mdi-magnify</VIcon>
            </VBtn>
          )}
        </VContainer>
      </VAppBar>
    );
  }
}
