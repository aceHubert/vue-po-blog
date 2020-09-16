import { Vue, Component } from 'vue-property-decorator';

@Component({
  name: 'WidgetB',
})
export default class WidgetB extends Vue {
  render() {
    return <div>Widget B</div>;
  }
}
