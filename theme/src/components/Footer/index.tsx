import { Vue, Component } from 'vue-property-decorator';
import { VContainer, VFooter } from '../vuetify-tsx';
// Types
import { Component as VueComponent, CreateElement } from 'vue';

@Component({
  name: 'theme-footer',
})
export default class Footer extends Vue {
  widgets: VueComponent[] = [];
  copyright = '';
  icp = '';

  // beforeCreate() {
  //   // @ts-ignore
  //   this.hook('footer_widgets')
  //     .filter(this.widgets)
  //     .then((widgets: VueComponent[]) => {
  //       this.widgets = widgets;
  //     });
  // }

  created() {
    this.copyright = this.getCopyright();
    this.icp = this.getICP();
  }

  render(h: CreateElement) {
    return (
      <VFooter>
        <VContainer class="text-center">
          {this.widgets.length ? (
            <ul class="widgets">
              {this.widgets.map((widget) => (
                <li>{h(widget)}</li>
              ))}
            </ul>
          ) : null}
          <p class="copyright caption mb-0 grey--text">{this.copyright}</p>
          <p class="caption mb-0 grey--text">
            <span>
              <a href="">beautify-theme</a> by Hubert
            </span>
            <span class="ml-2">{this.icp}</span>
          </p>
        </VContainer>
      </VFooter>
    );
  }
}
