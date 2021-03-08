import { Vue, Component } from 'nuxt-property-decorator';

@Component({
  name: 'CategoryCreate',
})
export default class CategoryCreate extends Vue {
  render() {
    return <h1>新建类别</h1>;
  }
}
