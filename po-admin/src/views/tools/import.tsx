import { Vue, Component } from 'nuxt-property-decorator';

{
  /* <router>
{
  meta:{
    title: 'Import',
  }
}
</router> */
}

@Component({
  name: 'ToolsImport',
})
export default class ToolsImport extends Vue {
  render() {
    return <h1>导入</h1>;
  }
}
