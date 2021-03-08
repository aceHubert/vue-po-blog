import { Vue, Component } from 'nuxt-property-decorator';

{
  /* <router>
{
  meta:{
    title: 'Export',
  }
}
</router> */
}

@Component({
  name: 'ToolsExport',
})
export default class ToolsExport extends Vue {
  render() {
    return <h1>导出</h1>;
  }
}
