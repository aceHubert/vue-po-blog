import { Vue, Component } from 'vue-property-decorator';
import { VAppBar, VContainer, VToolbarTitle, VSpacer } from '../vuetify-tsx';

@Component({
  name: 'Header',
})
export default class Footer extends Vue {
  get logo() {
    // @ts-ignore
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
      <VAppBar app dark color="primary">
        <VContainer>
          <VToolbarTitle>{this.logo}</VToolbarTitle>
          <VSpacer />
        </VContainer>
      </VAppBar>
    );
  }
}
