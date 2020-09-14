import { Vue, Component } from 'vue-property-decorator';
import { Component as VueComponent, CreateElement } from 'vue';
import './styles.scss';

@Component({
  name: 'Footer',
})
export default class Footer extends Vue {
  widgets: VueComponent[] = [];

  beforeCreate() {
    // @ts-ignore
    this.hook('footer_widgets')
      .filter(this.widgets)
      .then((widgets: VueComponent[]) => {
        this.widgets = widgets;
      });
  }

  render(h: CreateElement) {
    return (
      <footer>
        <h1>Footer</h1>
        {this.widgets.length ? (
          <ul class="widgets">
            {this.widgets.map((widget) => (
              <li>{h(widget)}</li>
            ))}
          </ul>
        ) : null}
        <div class="copyright align-center">COPYRIGHT XXXX</div>
      </footer>
    );
  }
}
