import { Vue, Component } from 'vue-property-decorator';

@Component({
  name: 'WidgetB',
})
export default class WidgetB extends Vue {
  created() {
    const arr = [1, 2];
    arr.map(a => {});
  }

  render() {
    return <div>Widget B</div>;
  }
}
