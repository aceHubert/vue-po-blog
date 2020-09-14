import { Vue, Component } from 'vue-property-decorator';

@Component({
  name: 'layout-root',
})
export default class LayoutRoot extends Vue {
  render(h: any) {
    return <router-view />;
  }
}
