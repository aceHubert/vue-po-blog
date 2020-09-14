import { Vue, Component } from 'vue-property-decorator';
import VAppBar from '../vuetify-tsx/components/VAppBar';
import VToolbarTitle from '../vuetify-tsx/components/VToolbarTitle';

@Component({
  name: 'Header',
})
export default class Footer extends Vue {
  render() {
    return (
      <VAppBar app>
        <VToolbarTitle>Header</VToolbarTitle>
      </VAppBar>
    );
  }
}
