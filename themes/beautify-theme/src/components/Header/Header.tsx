import { Vue, Component } from 'vue-property-decorator';
import { VAppBar, VContainer, VAppBarNavIcon, VToolbarTitle, VSpacer, VImg, VIcon, VBtn } from '../vuetify-tsx';
import { RootParams } from '../RootWarp';

@Component({
  name: 'theme-header',
})
export default class Header extends Vue {
  get logo() {
    const logo = this.getLogo();
    if (logo) {
      if (logo.type === 'text') {
        return <span>{logo.content}</span>;
      } else {
        // todo: image logo
        return <img />;
      }
    }
    return null;
  }

  render() {
    return (
      <VAppBar
        color="primary"
        app
        dark
        // shrink-on-scroll={this.$vuetify.breakpoint.mdAndUp}
        // src="https://picsum.photos/1920/1080?random"
        {...{
          scopedSlots: {
            img: ({ props }) => (
              <VImg gradient="to top right, rgba(19,84,122,.5), rgba(128,208,199,.8)" {...{ props }} />
            ),
          },
        }}
      >
        <VContainer style="padding:0;display:flex;align-items: center;">
          <VAppBarNavIcon
            class="hidden-md-and-up"
            onClick={() => {
              RootParams.drawerShown = true;
            }}
          ></VAppBarNavIcon>
          <VToolbarTitle>{this.logo}</VToolbarTitle>
          <VSpacer />
          {this.$vuetify.breakpoint.mdAndUp ? (
            <div class="subtitle-2 hidden-sm-and-down" style="align-self:flex-end;">
              {RootParams.menus.map((menu) => (
                <nuxt-link
                  to={menu.to}
                  exact
                  active-class="accent--text"
                  class="ml-3 text-decoration-none text-no-wrap"
                  style="color:inherit;"
                >
                  {menu.icon ? (
                    <VIcon size="1.25em" class="mr-1" style="vertical-align: text-bottom; color: inherit;">
                      {menu.icon}
                    </VIcon>
                  ) : null}
                  {menu.label}
                </nuxt-link>
              ))}
              <VBtn small icon class="ml-3" onClick={() => this.$router.push({ name: 'theme-search' })}>
                <VIcon>mdi-magnify</VIcon>
              </VBtn>
            </div>
          ) : (
            <VBtn icon onClick={() => this.$router.push({ name: 'theme-search' })}>
              <VIcon>mdi-magnify</VIcon>
            </VBtn>
          )}
        </VContainer>
      </VAppBar>
    );
  }
}
