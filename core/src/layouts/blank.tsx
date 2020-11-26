import { Vue, Component } from 'vue-property-decorator';

@Component({
  name: 'layout-blank',
})
export default class LayoutBlank extends Vue {
  render(h: any) {
    return <nuxt />;
  }
}
