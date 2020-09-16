import { Vue, Component } from 'vue-property-decorator';
import { VContainer, VFooter } from '../vuetify-tsx';
import './styles.scss';

// Types
import { Component as VueComponent, CreateElement } from 'vue';

@Component({
  name: 'Footer',
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
    // @ts-ignore
    this.copyright = this.getCopyright();
    // @ts-ignore
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
          <p class="copyright caption mb-0 grey--text text--darken-1">{this.copyright}</p>
          <p class="caption mb-0 grey--text text--darken-1">
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
